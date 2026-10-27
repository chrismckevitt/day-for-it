import {useState} from "react";

export default function CookieBanner() {
    const [show, setShow] = useState(true);
    return (show ?
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-6 pb-6">
                <div
                    className="pointer-events-auto ml-auto max-w-xl rounded-2xl bg-primary p-6 outline-1 -outline-offset-1 outline-primary-foreground/10">
                    <p className="text-sm/6 text-primary-foreground">
                        This website <strong>does not</strong> use cookies. You have a right to browse the internet without surveillance.
                    </p>
                    <div className="mt-4 flex items-center gap-x-5">
                        <button
                            type="button"
                            className="rounded-full bg-accent px-8 py-2 text-sm font-semibold uppercase text-accent-foreground inset-ring inset-ring-primary-foreground/10 hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            onClick={() => setShow(false)}
                        >
                            Hide
                        </button>
                    </div>
                </div>
            </div> : null
    )
}
