import { _decorator, Component, Node, Label, instantiate, Prefab, Sprite, Button, Color } from 'cc';
import { TD } from '../data/TaskData';
const { ccclass, property } = _decorator;

enum Status {
    UNCOMPLETE,
    COMPLETE
}


@ccclass('TaskDetailPanel')
export class TaskDetailPanel extends Component {
    @property(Node)
    public listContent: Node = null

    @property(Prefab)
    public prefabTaskDetailItem: Prefab = null

    //tempData
    public data_taskId: number = null

    data_setTaskId(taskId: number) {
        this.data_taskId = taskId
        this.updateView()
    }

    updateView() {
        const taskData = TD.getTaskData(this.data_taskId)
        const labelTitle = this.node.getChildByName('Label').getComponent(Label)
        labelTitle.string = taskData.name

        this.listContent.destroyAllChildren()
        const maxItemNum = taskData.length
        for (let i = 0; i < maxItemNum; i++) {
            const status = TD.getTaskPercentState(this.data_taskId, i)
            const item = instantiate(this.prefabTaskDetailItem)
            item.active = true
            item.parent = this.listContent
            item.getComponent(Sprite).color = status == Status.UNCOMPLETE ? Color.WHITE : new Color('#47E4DE')
            item.getChildByName('Label').getComponent(Label).string = (i + 1).toString()
            const event = item.getComponent(Button).clickEvents[0]
            event.customEventData = i.toString()
            event.target = this.node
            event.component = 'TaskDetailPanel'
            event.handler = 'onBtnMark'
        }
    }

    onBtnMark(evt: Event, customData: string) {
        const index = Number(customData)
        const status = TD.getTaskPercentState(this.data_taskId, index)
        const toggleStatus = status == Status.UNCOMPLETE ? Status.COMPLETE : Status.UNCOMPLETE
        TD.setTaskPercent(this.data_taskId, index, toggleStatus)
        this.updateView()
    }

    onBtnClose() {
        this.node.active = false
    }
}


