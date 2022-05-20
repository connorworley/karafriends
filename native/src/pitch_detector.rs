use std::sync::Arc;

use realfft::{ComplexToReal, RealFftPlanner, RealToComplex};

pub struct PitchDetector {
    sample_rate: f32,
    fft: Arc<dyn RealToComplex<f32>>,
    rfft: Arc<dyn ComplexToReal<f32>>,
}

impl PitchDetector {
    pub fn new(sample_rate: f32, sample_count: usize) -> PitchDetector {
        PitchDetector {
            sample_rate,
            fft: RealFftPlanner::<f32>::new().plan_fft_forward(sample_count),
            rfft: RealFftPlanner::<f32>::new().plan_fft_inverse(sample_count),
        }
    }

    pub fn detect(&self, mut samples: Vec<f32>) -> (f32, f32) {
        let B = samples.len();
        let W = samples.len() / 2;

        let squares: Vec<f32> = samples.iter().map(|sample| sample * sample).collect();

        let mut sqdiff = vec![0.0; B];
        sqdiff[0] = squares[..W].iter().sum::<f32>() * 2.0;
        for tau in 1..W {
            sqdiff[tau] = sqdiff[tau - 1] - squares[tau - 1] + squares[W + tau - 1];
        }

        let mut kernel = self.fft.make_input_vec();
        for i in 0..W {
            kernel[i + 1] = samples[W - i - 1];
        }

        let mut fft_scratch = self.fft.make_scratch_vec();

        let mut samples_spectrum = self.fft.make_output_vec();
        self.fft
            .process_with_scratch(&mut samples, &mut samples_spectrum, &mut fft_scratch)
            .unwrap();

        let mut kernel_spectrum = self.fft.make_output_vec();
        self.fft
            .process_with_scratch(&mut kernel, &mut kernel_spectrum, &mut fft_scratch)
            .unwrap();

        let mut complex_product = kernel_spectrum
            .iter()
            .zip(samples_spectrum.iter())
            .map(|(k, s)| k * s)
            .collect::<Vec<_>>();

        let mut rt_of_tau = self.rfft.make_output_vec();
        self.rfft
            .process(&mut complex_product, &mut rt_of_tau)
            .unwrap();

        let mut yin = vec![0.0; W];
        yin[0] = 1.0;
        for tau in 1..W {
            yin[tau] = sqdiff[tau] - 2.0 * rt_of_tau[tau + W] / B as f32;
        }

        let mut tmp2 = 0.0;
        for tau in 1..W {
            tmp2 += yin[tau];
            if tmp2 != 0.0 {
                yin[tau] *= tau as f32 / tmp2;
            } else {
                yin[tau] = 1.0;
            }
            if tau > 4 {
                let period = tau - 3;
                if (yin[period] < 0.15) && (yin[period] < yin[period + 1]) {
                    return (
                        if yin[period] > 0.0 {
                            freq2midi(self.sample_rate / quadratic_peak_pos(&yin, period))
                        } else {
                            0.0
                        },
                        1.0 - yin[period],
                    );
                }
            }
        }

        let min_index = yin
            .iter()
            .enumerate()
            .min_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
            .map(|(index, _)| index)
            .unwrap();
        (
            if yin[min_index] > 0.0 {
                freq2midi(self.sample_rate / quadratic_peak_pos(&yin, min_index))
            } else {
                0.0
            },
            1.0 - yin[min_index],
        )
    }
}

fn quadratic_peak_pos(x: &Vec<f32>, pos: usize) -> f32 {
    let x0 = pos - 1;
    let x2 = pos + 1;
    let s0 = x[x0];
    let s1 = x[pos];
    let s2 = x[x2];
    return pos as f32 + 0.5 * (s0 - s2) / (s0 - 2.0 * s1 + s2);
}

fn freq2midi(freq: f32) -> f32 {
    if freq < 2.0 || freq > 100000.0 {
        return 0.0;
    }
    return (freq / 6.875).ln() / 2.0_f32.ln() * 12.0 - 3.0;
}
