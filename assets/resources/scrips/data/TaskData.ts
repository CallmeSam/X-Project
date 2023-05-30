import { sys } from "cc"

const Init_Length = 100
const Key = 'TaskItemsName'
const SubKey_Prefix = 'Task_' //id
const Bit = 32
type SubData = {
    id: number,
    name: string,
    length: number,
    percent: number[] //2进制记录
}
export class TaskData {
    public tasksId: number[] = []
    public tasksData: SubData[] = []

    constructor() {

    }

    loadData() {
        const idsStr = sys.localStorage.getItem(Key)
        if (idsStr) {
            const ids = JSON.parse(idsStr)
            this.tasksId = ids
        }

        for(let id of this.tasksId) {
            const dataStr = sys.localStorage.getItem(SubKey_Prefix + id)
            if (dataStr) {
                const data = JSON.parse(dataStr) as SubData
                this.tasksData.push(data)
            }
        }
    }

    public getTaskData(id: number) {
        if (typeof id == "number") {
            return this.tasksData.find(value => value.id == id)
        }
    }

    public setTaskLength(id: number, length: number) {
        const taskData = this.getTaskData(id)
        if (taskData) {
            taskData.length = length
            this.writeTaskData(id)
        }
    }

    public setTaskPercent(id: number, index: number, state: number) { //state 为0和1 index起始为0
        const taskData = this.getTaskData(id)
        if(taskData) {
            const {numIndex, bit} = this.taskIndexToBit(index)//假设可用比特位为10为  index为10那么是第十一位 需要拓展到第二个数
            let num = taskData.percent[numIndex]
            if (state == 1) { //完成
                if (num == undefined) {
                    taskData.percent.length = numIndex + 1
                    num = 0
                }
                const oldNum = num
                num |= 1 << (bit - 1)
                if (oldNum != num) {
                    taskData.percent[numIndex] = num
                    this.writeTaskData(id)
                }
            }
            else if (state == 0){
                if (num) {
                    const oldNum = num
                    num &= ~(1 << bit - 1)
                    if (oldNum != num) {
                        taskData.percent[numIndex] = num
                        this.writeTaskData(id)
                    }
                }
            }
        }
    }

    public getTaskPercentState(id: number, index: number) {
        const taskData = this.getTaskData(id)
        if (taskData) {
            const {numIndex, bit} = this.taskIndexToBit(index)//假设可用比特位为10为  index为10那么是第十一位 需要拓展到第二个数
            let num = taskData.percent[numIndex]
            if (num) {
                return num & (1 << (bit - 1))
            }
            else {
                return 0
            }
        }
    }

    public addTask(taskName: string) {
        const newId = this.genId()
        this.tasksId.push(newId)
        let task: SubData = {
            id : newId,
            name : taskName,
            length : Init_Length,
            percent: []
        }
        this.tasksData.push(task)
        this.writeTaskData(newId)
        sys.localStorage.setItem(Key, JSON.stringify(this.tasksId))
    }

    public removeTask(id: number) {
        let index = this.tasksId.indexOf(id)
        if (index != -1) {
            this.tasksId.splice(index, 1)
            sys.localStorage.setItem(Key, JSON.stringify(this.tasksId))
            index = this.tasksData.findIndex(value => value.id == id)
            if (index != -1) {
                this.tasksData.splice(index, 1)
                sys.localStorage.removeItem(SubKey_Prefix + id)
            }
        }
    }

    protected genId() {
        return this.tasksId.length == 0 ? 0 : this.tasksId[this.tasksId.length - 1] + 1
    }

    protected writeTaskData(id: number) {
        const taskData = this.getTaskData(id)       
        if (taskData) {
            sys.localStorage.setItem(SubKey_Prefix + id, JSON.stringify(taskData))
        }
    }

    protected taskIndexToBit(index: number) { //根据task上面显示的日期索引 转换成比特位 一个数字的最大比特位为53 索引一旦超过 则会创建新的数字
        const numIndex = Math.ceil((index + 1) / Bit) - 1 //假设可用比特位为10为  index为10那么是第十一位 需要拓展到第二个数
        let bit = (index + 1) % Bit
        bit = bit == 0 ? Bit : bit
        return {numIndex: numIndex, bit: bit}
    }
}

export let TD: TaskData = new TaskData()