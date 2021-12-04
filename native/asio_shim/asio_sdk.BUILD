cc_library(
    name = "asio_sdk",
    srcs = glob([
        "common/*.cpp",
        "host/*.cpp",
        "host/pc/*.cpp",
    ], exclude = ["common/asiodrvr.cpp", "common/dllentry.cpp"]),
    hdrs = glob([
        "common/*.h",
        "host/*.h",
        "host/pc/*.h",
    ]),
    includes = [
        "common",
        "host",
        "host/pc",
    ],
    linkopts = [
        "-ladvapi32",
        "-lole32",
        "-luser32",
        "-luuid",
        "-lstdc++",
    ],
    linkstatic = True,
    visibility = ["//visibility:public"],
)