import axios from 'axios'
import Swal from 'sweetalert2'
const API_URL: string = 'https://todolist-api.hexschool.io';
let token: string | null = localStorage.getItem('token');

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Authorization'] = token;
axios.defaults.headers.post['Content-Type'] = 'application/json';


interface Todo {
    id: string;
    createTime: number;
    content: string;
    status: boolean;
}

interface GetTodosResponse {
    status: boolean;
    data: Todo[];
}

interface ApiResponse<T> {
    data: T;
}

interface SuccessLoginResponse {
    status: boolean;
    exp: number;
    token: string;
}

interface SuccessRegisterResponse {
    status: boolean;
    uid: string;
}

interface ErrorResponse {
    status: boolean;
    message: string;
}

const getInputValue = (id: string): string => {
    return (document.getElementById(id) as HTMLInputElement).value;
};

async function handleAsyncOperation<T>(operation: Promise<ApiResponse<T>>, successMessage: string, errorMessage: string): Promise<T | null> {
  try {
    const response = await operation;
    console.log(successMessage, response.data);
    return response.data;
  } catch (error:any) {
    const errorResponse: ErrorResponse = error.response.data;
    console.error(errorMessage, errorResponse.message);
    Swal.fire(errorMessage, errorResponse.message, "error");
    return null;
  }
}

const login = async (): Promise<void> => {
    const email: string = getInputValue('email');
    const password: string = getInputValue('password');
    const data = await handleAsyncOperation(
        axios.post<SuccessLoginResponse>('/users/sign_in', { email, password }),
        '登入成功',
        '登入錯誤'
    );
    if (data) {
        const token = data.token;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = token;
        await getTodos();
        Swal.fire("登入成功!", "", "success");
    }
};

// Similar for register, getTodos, displayTodos, editTodo, deleteTodo, addTodo
document.querySelector("#login")?.addEventListener("click",()=>{
 login();
})
const register = async (): Promise<void> => {
  const email: string = getInputValue('email');
  const password: string = getInputValue('password');
  const data = await handleAsyncOperation(
    axios.post<SuccessRegisterResponse>('/users/sign_up', { email, password, nickname: 'User' }),
    '註冊成功',
    '註冊錯誤'
  );
  if (data) {
    Swal.fire("註冊成功!", "", "success");
  }
};
document.querySelector("#register")?.addEventListener("click",()=>{
 register();
})
const getTodos = async (): Promise<void> => {
  const data = await handleAsyncOperation(
    axios.get<GetTodosResponse>('/todos/'),
    '獲取代辦事項成功',
    '獲取代辦事項錯誤'
  );
  if (data) {
    displayTodos(data.data);
  }
};

const editTodo = async (id: string): Promise<void> => {
  const newContent: string | null = prompt('請輸入新的待辦事項內容');
  if (newContent) {
    const data = await handleAsyncOperation(
      axios.put<Todo>(`/todos/${id}`, { content: newContent }),
      '編輯成功',
      '編輯錯誤'
    );
    if (data) {
      await getTodos();
      Swal.fire("編輯成功!", "", "success");
    }
  }
}

const deleteTodo = async (id: string): Promise<void> => {
  const data = await handleAsyncOperation(
    axios.delete<Todo>(`/todos/${id}`),
    '刪除成功',
    '刪除錯誤'
  );
  if (data) {
    await getTodos();
    Swal.fire("刪除成功!", "", "success");
  }
} 

const addTodo = async (): Promise<void> => {
  const content: string = getInputValue('todoContent');
  const data = await handleAsyncOperation(
    axios.post<Todo>('/todos/', { content }),
    '添加成功',
    '添加錯誤'
  );
  if (data) {
    await getTodos();
    Swal.fire("添加成功!", "", "success");
  }
};

const init = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (token) {
        await getTodos();
    } else {
        console.log('尚未登入');
    }
};

init();
const todoList = document.getElementById('todoList') as HTMLElement;
const displayTodos = (todos: Todo[]): void => {
    
    todoList.innerHTML = ''; // 清空當前列表

    todos.forEach(todo => {
        todoList.innerHTML += `
            <li>
                ${todo.content}
                <button class="edit" data-id="${todo.id}">編輯</button>
                <button class="delete" data-id="${todo.id}">刪除</button>
            </li>
        `;
    });
}

todoList.addEventListener('click', async function (event: Event) {
    if ((event.target as HTMLElement).classList.contains('edit')) {
        const id = (event.target as HTMLElement).dataset.id;
        if (id !== undefined) {
            await editTodo(id);
        }
    } else if ((event.target as HTMLElement).classList.contains('delete')) {
        const id = (event.target as HTMLElement).dataset.id;
        if (id !== undefined) {
            await deleteTodo(id);
        }
    }
});

document.querySelector("#addTodo")?.addEventListener("click",()=>{
 addTodo();
})