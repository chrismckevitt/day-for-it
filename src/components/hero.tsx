export default function Hero() {
    return (
        <div className="grid h-200 grid-cols-1 lg:grid-cols-2 bg-primary">

                <div className="">
                    <h1 className="font-heading text-7xl font-bold text-primary-foreground">
                       Day for It
                    </h1>
                    <h2 className="font-heading text-5xl  text-primary-foreground">
                       Campers
                    </h2>
                </div>

            <div className="relative overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                >
                    <source src="/video/boxer-hero.webm" type="video/webm"/>
                    <source src="/video/boxer-hero.mp4" type="video/mp4"/>
                </video>
            </div>
        </div>

    )
}
