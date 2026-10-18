import { error } from 'console'
import {create} from 'zustand'

export enum ErrorStatus{
    null, //ko error
    login,
    fileSize
}
interface DraggingTheme{
    dragging:boolean,
    error:ErrorStatus
    setDragging: (newStatus:boolean) => void
    setError:(newError:ErrorStatus) =>void
}

export const patientTheme = create<DraggingTheme>((set,get)=>({
    dragging:false,
    error:ErrorStatus.null,
    setDragging:(newStatus:boolean) =>set({dragging:newStatus}),
    setError:(newError:ErrorStatus) => ({error: newError})
}))