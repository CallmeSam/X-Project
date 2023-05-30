import { _decorator, Component, Node, EditBox } from 'cc';
import { TD } from '../data/TaskData';
import { asyncManager } from '../manager/AsyncManager';
const { ccclass, property } = _decorator;

@ccclass('TaskAddPanel')
export class TaskAddPanel extends Component {
    @property(EditBox) 
    public editBox = null

    onBtnConfirm() {
        const taskName = this.editBox.string
        TD.addTask(taskName)
        this.node.destroy()
        asyncManager.resolve('TaskAddPanel')
    }

    onBtnClose() {
        this.node.destroy()
        // asyncManager.reject('TaskAddPanel')
    }
}


