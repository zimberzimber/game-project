import { UiEntityBase } from "../Entities/EntityBase";
import { ButtonBasicEntity } from "../Entities/Ui/Composite/Buttons";
import { DrawDirectiveText } from "../Components/Visual/DrawDirectiveText";
import { IAlignmentContainer } from "../Models/GenericInterfaces";
import { Vec2 } from "../Models/Vectors";

export class UiUtility {
    static InnerElementAlignmentOffset = (parentAlignment: IAlignmentContainer, childAlignment: IAlignmentContainer, parentSize: Vec2): Vec2 => {
        return [
            (childAlignment.horizontal - parentAlignment.horizontal) * 0.5 * parentSize[0],
            (childAlignment.vertical - parentAlignment.vertical) * 0.5 * parentSize[1]
        ]
    }
}