use nix::sys::socket::{
    accept, bind, connect, getsockname, listen, setsockopt, socket, sockopt, AddressFamily,
    Backlog, SockFlag, SockProtocol, SockType, SockaddrIn,
};
use std::os::fd::AsRawFd;

type Result<V> = std::result::Result<V, Box<dyn std::error::Error>>;

fn main() -> Result<()> {
    // Ported from https://github.com/Yelp/ephemeral-port-reserve/blob/master/ephemeral_port_reserve.py
    let s = socket(
        AddressFamily::Inet,
        SockType::Stream,
        SockFlag::empty(),
        SockProtocol::Tcp,
    )?;
    setsockopt(&s, sockopt::ReuseAddr, &true)?;
    bind(s.as_raw_fd(), &SockaddrIn::new(127, 0, 0, 1, 0))?;
    listen(&s, Backlog::new(1)?)?;

    let sockname: SockaddrIn = getsockname(s.as_raw_fd())?;

    let s2 = socket(
        AddressFamily::Inet,
        SockType::Stream,
        SockFlag::empty(),
        SockProtocol::Tcp,
    )?;
    connect(s2.as_raw_fd(), &sockname)?;
    accept(s.as_raw_fd())?;
    println!("{}", sockname.port());
    Ok(())
}
