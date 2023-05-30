import { _decorator, Component, Node, Prefab, sys, EditBox, instantiate, Label, Button, Sprite, Color, profiler, macro, dynamicAtlasManager } from 'cc';
import { TD } from '../data/TaskData';
import { asyncManager } from '../manager/AsyncManager';
import { TaskDetailPanel } from './TaskDetailPanel';
const { ccclass, property } = _decorator;

@ccclass('MainLayer')
export class MainLayer extends Component {
    @property(Prefab)
    public prefabAddPanel: Prefab = null

    @property(Prefab)
    public prefabTaskDetailPanel: Prefab = null

    @property(Prefab)
    public taskItem: Prefab = null

    @property(Node)
    public listContent: Node = null

    start() {
        // profiler.showStats()
        TD.loadData()
        // TD.removeTask(0)
        this.updateList()
    }

    showAddPanel() {
        const panel = instantiate(this.prefabAddPanel)
        this.node.addChild(panel)
        asyncManager.waitResult('TaskAddPanel', () => {
            this.updateList()
        })
    }

    updateList() {
        this.listContent.destroyAllChildren()

        for (let i = 0; i < TD.tasksId.length; i++) {
            const id = TD.tasksId[i]
            const data = TD.getTaskData(id)
            const item = instantiate(this.taskItem)
            item.active = true
            item.parent = this.listContent
            const label = item.getChildByName('Label').getComponent(Label)
            label.string = data.name
            const event = item.getComponent(Button).clickEvents[0]
            event.customEventData = data.id.toString()
            event.target = this.node
            event.handler = 'onBtnTask'
            event.component = 'MainLayer'
        }
    }

    onBtnAdd() { //要添加任务
        this.showAddPanel()
    }

    onBtnTask(evt: Event, taskId: string) {
        const panel = instantiate(this.prefabTaskDetailPanel)
        panel.parent = this.node
        panel.getComponent(TaskDetailPanel).data_setTaskId(Number(taskId))
    }
}


