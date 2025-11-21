import { ReactNode } from "react";

export default function HeaderEditSvyato({children}:{children:ReactNode}){
    return <div className="flex w-full justify-between p-[8px] border-b-2 sticky">{children}</div>
}