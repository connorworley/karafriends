#include <future>
#include <utility>

#include "asio.h"
#include "asiodrivers.h"

template<typename F>
auto lambda_to_fp(F f) {
    static auto fp = std::forward<F>(f);
    return [](auto... args) {
        return fp(args...);
    };
}

extern "C" {
    void start(char* driver_name, void(*callback)(int*, int*, int, void*), void* data) {
        AsioDrivers drivers;
        drivers.loadDriver(driver_name);

        ASIODriverInfo info {
            .asioVersion = 2,
            // .sysRef = ???,
        };
        ASIOInit(&info);
        // std::cout << info.name << std::endl;

        long min_size, _max_size, _preferred_size, _granularity;
        ASIOGetBufferSize(&min_size, &_max_size, &_preferred_size, &_granularity);

        
        ASIOBufferInfo buffer_infos[] = {
            {
                .isInput = true,
                .channelNum = 0,
            },
            {
                .isInput = true,
                .channelNum = 1,
            },
        };

        ASIOCallbacks callbacks {
            .bufferSwitch = [](long double_buffer_index, ASIOBool direct_process) {
                // std::cout << "bufferSwitch called" << std::endl;
            },
            .sampleRateDidChange = [](ASIOSampleRate sample_rate) {
                // std::cout << "sampleRateDidChange called" << std::endl;
            },
            .asioMessage = [](long selector, long value, void* message, double* opt) -> long {
                // std::cout << "asioMessage called with selector " << selector << std::endl;
                switch (selector) {
                case kAsioSelectorSupported:
                    // std::cout << value << std::endl;
                    switch (value) {
                        case kAsioSelectorSupported:
                        case kAsioEngineVersion:
                        // case kAsioResetRequest:
                        // case kAsioBufferSizeChange:
                        // case kAsioResyncRequest:
                        // case kAsioLatenciesChanged:
                        case kAsioSupportsTimeInfo:
                            return 1;
                    }
                    return 0;
                case kAsioEngineVersion:
                    return 2;
                case kAsioResetRequest:
                    // TODO: reset?
                    return 0;
                case kAsioBufferSizeChange:
                    return 0;
                case kAsioResyncRequest:
                    // TODO: reset?
                    return 0;
                case kAsioLatenciesChanged:
                    return 0;   
                case kAsioSupportsTimeInfo:
                    return 1;
                }
                return 0;
            },
            .bufferSwitchTimeInfo = lambda_to_fp(
                    [&buffer_infos, min_size, callback, data](ASIOTime* params, long double_buffer_index, ASIOBool direct_process) -> ASIOTime* {
                    int* in_buffer_1 = (int*)buffer_infos[0].buffers[double_buffer_index];
                    int* in_buffer_2 = (int*)buffer_infos[1].buffers[double_buffer_index];
                    callback(in_buffer_1, in_buffer_2, min_size, data);
                    return nullptr;
                }),
        };
        
        ASIOCreateBuffers(&buffer_infos[0], 2, min_size, &callbacks);
        ASIOControlPanel();
        ASIOStart();

        // pause thread
        std::promise<void>().get_future().wait();
    }
}