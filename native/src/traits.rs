pub trait AudioSystemTrait {
    type InputDevice: InputDeviceTrait;
    fn input_devices() -> Vec<String>;
    fn output_devices() -> Vec<String>;
    fn new_input_device(name: &str) -> Self::InputDevice;
}

pub trait InputDeviceTrait {
    fn get_pitch(&mut self) -> (f32, f32);
}
