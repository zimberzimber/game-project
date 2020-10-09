import { IGameState } from "../GameStates/GameStateBase";
import { GameStateGame } from "../GameStates/GameStateGame";
import { GameStatePaused } from "../GameStates/GameStatePaused";
import { Log } from "./Logger";
import { Config } from "../Proxies/ConfigProxy";
import { GameStateTitleScreen } from "../GameStates/GameStateTitleScreen";
import { GameStateIntro } from "../GameStates/GameStateIntro";
import { GameStateDebug } from "../GameStates/GameStateDebug";

interface IStateContainer {
    stateInstance: IGameState;
    nextStates: string[];
}

const initialState = 'debug';
const GameStateDictionary: { [key: string]: IStateContainer } = {
    debug: {
        stateInstance: new GameStateDebug(),
        nextStates: [],
    },
    intro: {
        stateInstance: new GameStateIntro(),
        nextStates: ['title'],
    },
    title: {
        stateInstance: new GameStateTitleScreen(),
        nextStates: ['game'],
    },
    game: {
        stateInstance: new GameStateGame(),
        nextStates: ['paused']
    },
    paused: {
        stateInstance: new GameStatePaused(),
        nextStates: ['game']
    },
}

if (Config.GetConfig('debug', false) === true) {
    //@ts-ignore
    window.zz = window.zz || {};
    //@ts-ignore
    window.zz.states = GameStateDictionary;
}

class GameStateManager {
    private _currentState: string;
    get CurrentState(): string { return this._currentState };

    Initialize(): void {
        if (this._currentState) {
            Log.Warn('GameStateManager already initialization.');
        } else if (GameStateDictionary[initialState]) {
            this._currentState = initialState;
            GameStateDictionary[this._currentState].stateInstance.OnActivated();
        } else
            Log.Error(`Game state '${initialState}' doesn't exist. GameStateManager initialization failed.`);
    }

    ChangeState(stateName: string, args?: any): void {
        if (!GameStateDictionary[stateName]) {
            Log.Warn(`Game state '${stateName}' doesn't exist.`);
        } else if (this.CanTransitionTo(stateName)) {
            GameStateDictionary[this._currentState].stateInstance.OnDeactivated();
            this._currentState = stateName;
            GameStateDictionary[this._currentState].stateInstance.OnActivated(args);
        } else
            Log.Warn(`Game state '${this._currentState}' cannot transition to '${stateName}'`)
    }

    CanTransitionTo(stateName: string): boolean {
        if (!this._currentState) return true;
        return GameStateDictionary[this._currentState].nextStates.indexOf(stateName) > -1;
    }

    StateUpdate(delta: number): void {
        GameStateDictionary[this._currentState].stateInstance.Update(delta);
    }

    GetCurrentStateParameter(parameterName: string): any {
        const st = GameStateDictionary[this._currentState];
        return st && st.stateInstance.PublicParameters ? st.stateInstance.PublicParameters[parameterName] : undefined;
    }
}

export const StateManager = new GameStateManager();