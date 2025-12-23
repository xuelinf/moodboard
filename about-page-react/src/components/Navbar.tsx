

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 py-5 px-10 flex justify-between items-center z-[1000] bg-[#050505]/80 backdrop-blur-xl border-b border-border-light">
            <div className="font-[800] text-xl tracking-tighter">43 LENS</div>
            <a
                href="https://video.lab.43consult.com/"
                className="text-sm text-white no-underline px-5 py-2 border border-border-light rounded-full transition-all duration-300 hover:bg-white hover:text-black"
            >
                申请内测
            </a>
        </nav>
    );
};
