import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { PlayerEntity } from "../Entities/Player";
import { HitboxBase } from "../Bases/HitboxBase";
import { ComponentBase } from "../Bases/ComponentBase";
import { TriggerState } from "../Models/TriggerState";
import CheckCollision from "./HitboxCollisionChecker";
import { IDOMDependant } from "../Bases/MiscInterfaces";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { TestEntity } from "../Entities/Test";
import { WebglDrawData } from "../Models/WebglDrawData";
import WebglProxy from "../Proxies/WebglProxy";
import ShaderSourcesProxy from "../Proxies/ShaderSourcesProxy";

export class Game implements IDOMDependant {
    canvas: any;
    interval: any;
    entities: EntityBase[];
    FPSInterval: number;
    paused: boolean = false;

    frameDelta: number = 0;
    oldFrameTime: number = new Date().getTime();

    fpsCounter: number = 0;
    oldTime: number = new Date().getTime();
    fpsDisplay: number = 0;

    OnDomLoaded(): void {
        this.canvas = document.getElementById("game-canvas");
        this.canvas.width = 600;
        this.canvas.height = 500;

        WebglProxy.Init(ShaderSourcesProxy.GetVertexShader(), ShaderSourcesProxy.GetFragmentShader(), this.canvas, document.getElementById('sprites'))

        this.entities = [];
        let p = new PlayerEntity();
        this.AddEntity(p);

        const count = 0;
        for (let i = 0; i < count; i++) {
            let newE: EntityBase;

            if (i % 2 == 0)
                newE = new TestEntity();
            else
                newE = new PlayerEntity();

            newE.transform.scale = [0.5, 1.5];
            newE.transform.position[0] = 30;
            p.AddChildEntity(newE);
            p = newE;
        }

        let test = new TestEntity();
        test.transform.position = [100, 100];
        test.transform.scale = [5, 5];
        this.AddEntity(test);

        // for (let i = 0; i < 100; i++) {
        //     const p = new TestEntity();
        //     p.transform.position = [-300 * Math.random(), -250 * Math.random()];
        //     this.AddEntity(p);

        //     const p2 = new PlayerEntity();
        //     p2.transform.position = [300 * Math.random(), 250 * Math.random()];
        //     this.AddEntity(p2);
        // }


        this.Start();
    }

    constructor() {
        this.entities = [];
    }

    Start(): void {
        requestAnimationFrame(this.Update.bind(this))
    }

    // Add an entity to the root of the entity tree.
    AddEntity(entity: EntityBase): void {
        this.entities.push(entity);
    }

    GetEntityById(id: number): EntityBase | null {
        const e = this.GetAllEntities().filter(e => e.entityId == id);
        if (e[0])
            return e[0];
        return null;
    }

    GetEntityTreeString(): string {
        let str = '';
        this.entities.forEach(e => {
            //@ts-ignore (object.constructor.name is not recognized by TypeScript)
            str = `${str}\n${this.GetEntityTreeStringHelper(e, 0)}`
        });
        return str;
    }

    private GetEntityTreeStringHelper(parent: EntityBase, depth: number): string {
        let str: string = '';
        for (let i = 0; i < depth; i++)
            str = `|${str}`;

        //@ts-ignore (object.constructor.name is not recognized by TypeScript)
        str = `${str}(${parent.entityId})${parent.constructor.name}`;
        parent.GetChildren().forEach(c => {
            str = `${str}\n${this.GetEntityTreeStringHelper(c, depth + 1)}`
        });
        return str;
    }

    // Function returning a collection of all the entities within the game. Utilizes 'GetAllEntitiesHelper'.
    GetAllEntities(): EntityBase[] {
        let entities: EntityBase[] = [];
        this.entities.forEach(entity => {
            entities.push(entity);
            if (entity.GetChildren().length > 0)
                entities = entities.concat(this.GetAllEntitiesHelper(entity));
        });
        return entities;
    }

    // Recursive helper function for obtaining children of a give parent entity.
    private GetAllEntitiesHelper(parent: EntityBase): EntityBase[] {
        let children: EntityBase[] = [];
        parent.GetChildren().forEach(child => {
            children.push(child);
            if (child.GetChildren().length > 0)
                children = children.concat(this.GetAllEntitiesHelper(child));
        })
        return children;
    }

    // Get components of a certain type from all the entities within the game.
    // Calls 'GetAllEntities' to obtain all the current entities, and passes that as a collection to 'GetAllComponentsOfTypeFromEntityCollection'
    GetAllComponentsOfType(type: any): ComponentBase[] {
        return this.GetAllComponentsOfTypeFromEntityCollection(type, this.GetAllEntities());
    }

    // Get components of a certain type from the given collection.
    GetAllComponentsOfTypeFromEntityCollection(type: any, collection: EntityBase[]): ComponentBase[] {
        let returned: ComponentBase[] = [];
        collection.forEach(e => returned = returned.concat(e.GetComponentsOfType(type)));
        return returned;
    }

    Update(): void {
        requestAnimationFrame(this.Update.bind(this));

        const newFrameTime = new Date().getTime();
        this.frameDelta = (newFrameTime - this.oldFrameTime) / 1000;
        this.oldFrameTime = newFrameTime;

        // Do nothing if game is paused
        if (this.paused) return;

        // Update all entities
        this.GetAllEntities().forEach(e => e.Update());

        // Updating all first and then reobtaining the list because entities may have been created due to other entities updating.
        const allEntities = this.GetAllEntities();
        let triggers: HitboxBase[] = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities).filter(c => (c as HitboxBase).GetTriggerState() != TriggerState.NotTrigger) as HitboxBase[];
        let colliders: HitboxBase[] = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities).filter(c => (c as HitboxBase).GetTriggerState() == TriggerState.NotTrigger) as HitboxBase[];

        triggers.forEach(t => colliders.forEach(c => { if (CheckCollision(t, c)) t.OnCollision(c); }));

        // Collect all drawing data:
        const dds = this.GetAllComponentsOfType(ImageDrawDirective);
        const triangleData: WebglDrawData = {
            vertexes: [],
            indexes: [],
        };

        for (let i = 0; i < dds.length; i++) {
            triangleData.vertexes = triangleData.vertexes.concat((dds[i] as ImageDrawDirective).GetWebGlData());

            const s = i * 4;
            triangleData.indexes = triangleData.indexes.concat([
                s, s + 1, s + 2,
                s, s + 2, s + 3
            ]);
        }

        WebglProxy.SetTriangleData(triangleData);

        // Draw collisions if the option is enabled
        if (_G.DebugDraw) {
            // this.fpsCounter++;
            // const time = new Date().getTime();
            // this.context.fillText(this.fpsDisplay, 10, 10);
            // if (time - this.oldTime >= 250) {
            //     this.fpsDisplay = Math.floor(this.fpsCounter / (time - this.oldTime) * 1000);
            //     this.oldTime = time;
            //     this.fpsCounter = 0;
            // }

            let indexOffset = triangleData.indexes[triangleData.indexes.length - 1] + 1;
            const lineData: WebglDrawData[] = [];
            const hitboxes = this.GetAllComponentsOfType(HitboxBase) as HitboxBase[];

            for (let i = 0; i < hitboxes.length; i++) {
                const hData: WebglDrawData | null = hitboxes[i].GetDebugDrawData()
                if (hData) {
                    for (let j = 0; j < hData.indexes.length; j++)
                        hData.indexes[j] += indexOffset;

                    indexOffset += hData.indexes.length - 2;
                    lineData.push(hData);
                }
                indexOffset += 1;
            }

            WebglProxy.SetLineData(lineData);
        }

        WebglProxy.Draw();
    }

    // Entities need a collision class
    // Draw directive and collision should have separate values
    // Different projectiles will have their own classes extending Entity
}
