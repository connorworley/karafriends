"""Provides a rule that outputs a monolithic static library."""

load("@bazel_tools//tools/cpp:toolchain_utils.bzl", "find_cpp_toolchain")

TOOLS_CPP_REPO = "@bazel_tools"

def _cc_static_library_impl(ctx):
    output_lib = ctx.actions.declare_file("{}.a".format(ctx.attr.name))
    output_flags = ctx.actions.declare_file("{}.link".format(ctx.attr.name))

    cc_toolchain = find_cpp_toolchain(ctx)

    lib_sets = []
    unique_flags = {}
    for dep in ctx.attr.deps:
        if hasattr(dep[CcInfo].linking_context.libraries_to_link, "to_list"):
            lib_sets.append(dep[CcInfo].linking_context.libraries_to_link)
        else:
            lib_sets.append(depset(direct = dep[CcInfo].linking_context.libraries_to_link))
        unique_flags.update({
            flag: None
            for flag in dep[CcInfo].linking_context.user_link_flags
        })
    libraries_to_link = depset(transitive = lib_sets)
    link_flags = unique_flags.keys()

    libs = []
    libs.extend([lib.pic_static_library for lib in libraries_to_link.to_list() if lib.pic_static_library])
    libs.extend([
        lib.static_library
        for lib in libraries_to_link.to_list()
        if lib.static_library and not lib.pic_static_library
    ])

    script_file = ctx.actions.declare_file("{}.mri".format(ctx.attr.name))
    commands = ["create {}".format(output_lib.path)]
    for lib in libs:
        commands.append("addlib {}".format(lib.path))
    commands.append("save")
    commands.append("end")
    ctx.actions.write(
        output = script_file,
        content = "\n".join(commands) + "\n",
    )

    ctx.actions.run_shell(
        command = "{} -M < {}".format(cc_toolchain.ar_executable, script_file.path),
        inputs = [script_file] + libs + cc_toolchain.all_files.to_list(),
        outputs = [output_lib],
        mnemonic = "ArMerge",
        progress_message = "Merging static library {}".format(output_lib.path),
    )
    ctx.actions.write(
        output = output_flags,
        content = "\n".join(link_flags) + "\n",
    )
    return [
        DefaultInfo(files = depset([output_flags, output_lib])),
    ]

cc_static_library = rule(
    implementation = _cc_static_library_impl,
    attrs = {
        "deps": attr.label_list(),
        "_cc_toolchain": attr.label(
            default = TOOLS_CPP_REPO + "//tools/cpp:current_cc_toolchain",
        ),
    },
    toolchains = [TOOLS_CPP_REPO + "//tools/cpp:toolchain_type"],
    incompatible_use_toolchain_transition = True,
)