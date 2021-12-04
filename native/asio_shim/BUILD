load("//:static_library.bzl", "cc_static_library")

cc_library(
    name = "asio_shim",
    srcs = [
        "src/asio_shim.cpp",
    ],
    hdrs = [
        "src/asio_shim.h",
    ],
    deps = [
        "@asio_sdk//:asio_sdk",
    ],
    linkstatic = True,
    copts = ["-std=c++17"],
)

cc_static_library(
    name = "asio_shim.static",
    deps = [":asio_shim"],
)

cc_binary(
    name = "test",
    srcs = ["src/main.cpp"],
    deps = [":asio_shim"],
)