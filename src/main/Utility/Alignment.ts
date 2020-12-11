import { HorizontalAlignment, IAlignable, VerticalAlignment } from "../Models/GenericInterfaces";
import { soundStore } from "../Models/IndexedDbSchemas";

export class AlignmentUtility {
    static Center<T extends IAlignable>(subject: T): void {
        subject.Alignment = {
            vertical: VerticalAlignment.Middle,
            horizontal: HorizontalAlignment.Middle
        }
    }

    static BottomMiddle<T extends IAlignable>(subject: T): void {
        subject.Alignment = {
            vertical: VerticalAlignment.Bottom,
            horizontal: HorizontalAlignment.Middle
        }
    }

    static BottomLeft<T extends IAlignable>(subject: T): void {
        subject.Alignment = {
            vertical: VerticalAlignment.Bottom,
            horizontal: HorizontalAlignment.Left
        }
    }

    static BottomRight<T extends IAlignable>(subject: T): void {
        subject.Alignment = {
            vertical: VerticalAlignment.Bottom,
            horizontal: HorizontalAlignment.Right
        }
    }

    static MiddleLeft<T extends IAlignable>(subject: T): void {
        subject.Alignment = {
            vertical: VerticalAlignment.Middle,
            horizontal: HorizontalAlignment.Left
        }
    }
}