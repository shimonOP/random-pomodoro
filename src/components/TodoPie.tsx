import {Todo} from '../datas/Todo';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Max_Pie_Todos } from '../types/constants';
import { PieChart } from '@mui/icons-material';
import { MyPieChart } from './MyPieChart';


interface TodoPieProps {
    todos: Todo[]
    legendVisible:boolean
    weight:(todo:Todo)=>number
}

ChartJS.register(ArcElement, Tooltip, Legend);
export default function TodoPie(props: TodoPieProps) {
    const {todos,weight} = props;
    if(todos.length > Max_Pie_Todos) return <></>
    const labels = todos.map(t=>t.displayTitle);
    const weights = todos.map(t=>weight(t));
    const sum = weights.reduce((a,b) => a+b, 0);
    if(sum <= 0) return <></>
    const options = {
        plugins: {
        legend: {
            display: props.legendVisible,
        },
    }
    }
    const data = {
        labels: labels,
        datasets: [
            {
                data: weights,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };
    return (
        // <Pie data={data} options={options}></Pie>
        <MyPieChart labels={labels} values={weights} />
        // <></>
    );
}