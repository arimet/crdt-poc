import * as Automerge from '@automerge/automerge';
import * as localforage from 'localforage';

const todoListID = 'todo-list';
const channelTodoList = new BroadcastChannel(todoListID);

// Initialize Document
let todoListDocument;

async function initTodoList() {
    const localCopy = await localforage.getItem(todoListID);
    if (localCopy) {
        todoListDocument = Automerge.load(localCopy);
    } else {
        todoListDocument = Automerge.init();
    }
}

await initTodoList();
const todoListInput = document.querySelector('input');
const todoListForm = document.getElementById('todolist_form');
renderTodoList(todoListDocument);

await loadFromRemote(todoListID);

async function loadFromRemote(id) {
    const response = await fetch(`http://localhost:5000/${id}`);
    if (response.status !== 200)
        throw new Error('No saved draft for doc with id=' + id);
    const respbuffer = await response.arrayBuffer();
    if (respbuffer.byteLength === 0)
        throw new Error('No saved draft for doc with id=' + id);
    const view = new Uint8Array(respbuffer);
    let newDoc = Automerge.merge(todoListDocument, Automerge.load(view));
    todoListDocument = newDoc;
    saveTodoList(todoListDocument);
    renderTodoList(newDoc);
}

function saveTodoListToRemote(docId, binary) {
    fetch(`http://localhost:5000/${docId}`, {
        body: binary,
        method: 'post',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
    }).catch((err) => console.log(err));
}

function saveTodoList(todoListDocument) {
    let bytes = Automerge.save(todoListDocument);
    localforage.setItem(todoListID, bytes).catch((err) => console.error(err));
    return bytes;
}

function toggle(todoListDocument, index) {
    return Automerge.change(todoListDocument, (todoListDocument) => {
        todoListDocument.items[index].done =
            !todoListDocument.items[index].done;
    });
}

function addTodoList(todoListDocument, value) {
    return Automerge.change(todoListDocument, (todoListDocument) => {
        if (!todoListDocument.items) todoListDocument.items = [];
        todoListDocument.items.push({
            value: value,
            done: false,
        });
    });
}

function renderTodoList(newDoc) {
    newDoc.items &&
        newDoc.items.forEach((item, index) => {
            let objId = Automerge.getObjectId(item);
            let itemEl = document.getElementById(objId);
            if (!itemEl) {
                itemEl = document.createElement('li');
                itemEl.setAttribute('id', objId);
                var label = document.createElement('label');
                label.innerHTML = item.value;
                itemEl.appendChild(label);
                document.getElementById('todolist_items').appendChild(itemEl);
            }

            itemEl.className = item.done ? 'line-through text-green-500' : '';

            itemEl.onclick = (ev) => {
                todoListDocument = toggle(todoListDocument, index);
                const binary = saveTodoList(todoListDocument);
                saveTodoListToRemote(todoListID, binary);
                renderTodoList(todoListDocument);
                channelTodoList.postMessage(binary);
            };
        });

    todoListForm.onsubmit = (ev) => {
        ev.preventDefault();
        todoListDocument = addTodoList(newDoc, todoListInput.value);
        const binary = saveTodoList(todoListDocument);
        saveTodoListToRemote(todoListID, binary);
        todoListInput.value = null;
        renderTodoList(todoListDocument);
        channelTodoList.postMessage(binary);
    };
}

channelTodoList.onmessage = function (ev) {
    let payload = ev.data;


    // this message is from the same actor, ignore it
    if (payload.actorId === Automerge.getActorId(todoListDocument)) return;
    let newDoc = Automerge.merge(todoListDocument, Automerge.load(ev.data));
    todoListDocument = newDoc;
    renderTodoList(newDoc);
};

// listener onClick on the button todolist_refresh
document.getElementById('todolist_refresh').onclick = (ev) => {
    loadFromRemote(todoListID);
};
