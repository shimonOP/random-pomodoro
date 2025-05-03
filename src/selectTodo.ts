import { Todo, getChildren, getRootTodos, isLeaf } from "./datas/Todo";

//指定されたtodosから一つ選ぶ
function selectFromTodos(todos: Todo[], weight: (todo: Todo) => number) {
    const weights = todos.map((t)=>weight(t))
    if(weights.length === 0) return undefined
    const sum = weights.reduce((a, b) => a + b);
    if (sum <= 0) return undefined;
    const ram = Math.random() * sum;
    let count = 0;
    for (let t of todos) {
        const w = weight(t)
        count += w;
        if (count > ram) return { item: t, prob: w / sum };
    }
}
//指定されたtodo以下の末端todoを一つ選ぶ
export function selectTodoAtRandom(todo: Todo | undefined, todosMap: Map<String, Todo>, weight: ((todo: Todo) => number)): { todo: Todo | undefined, probs: number[] } {
    if(todo && isLeaf(todo)){
        return {todo,probs:[]}
    }
    const res = todo ? 
        selectFromTodos(getChildren(todo, todosMap), weight) : 
        selectFromTodos(getRootTodos(todosMap), weight);
    if (res) {
        let { item: ramTodo, prob } = res;
        const { todo: resTodo, probs: resProbs } = selectTodoAtRandom(ramTodo, todosMap, weight);
        resProbs.unshift(prob);
        return { todo: resTodo, probs: resProbs }
    }
    return { todo, probs: [] };
}