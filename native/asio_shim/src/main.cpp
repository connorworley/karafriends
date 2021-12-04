#include <iostream>
#include <future>

#include "asio_shim.h"

int main() {
    start(
        const_cast<char*>("Focusrite USB ASIO"),
        [](int* samples , int sample_count) {
            for (int i = 0; i < sample_count; i++) {
                std::cout << samples[i] << std::endl;
            }
        });

    std::cout << "started" << std::endl;
    // pause thread
    std::promise<void>().get_future().wait();

    return 0;
}