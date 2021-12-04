extern "C" {
    void start(char* driver_name, void(*callback)(int*, int*, int, void*), void* data);
}