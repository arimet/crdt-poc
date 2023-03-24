import * as Automerge from '@automerge/automerge';
import * as localforage from 'localforage';

const counterID = 'counter';
const channelCounter = new BroadcastChannel(counterID);

let counterDocument;

async function initCounter() {
    const localCopy = await localforage.getItem(counterID);
    if (localCopy) {
        counterDocument = Automerge.load(localCopy);
    } else {
        counterDocument = Automerge.init();
        counterDocument = Automerge.change(counterDocument, (doc) => {
            // The counter is initialized to 0 by default. You can pass a number to the
            // Automerge.Counter constructor if you want a different initial value.
            doc.buttonClicks = new Automerge.Counter();
        });
    }
}

await initCounter();

renderCounter(counterDocument);

try {
    await loadFromRemote(counterID);
} catch (e) {
    console.log(e);
}

async function loadFromRemote(id) {
    const response = await fetch(`http://localhost:5000/${id}`);
    if (response.status !== 200)
        throw new Error('No saved draft for doc with id=' + id);
    const respbuffer = await response.arrayBuffer();
    if (respbuffer.byteLength === 0)
        throw new Error('No saved draft for doc with id=' + id);
    const view = new Uint8Array(respbuffer);
    const fetchDoc = Automerge.load(view);
    console.log(fetchDoc)
    let newDoc = Automerge.merge(counterDocument, fetchDoc);
    counterDocument = newDoc;
    const binary = saveCounter(counterDocument);
    saveCounterToRemote(counterID, binary);
    renderCounter(newDoc);
}

function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    { 
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
}

function saveCounterToRemote(docId, binary) {
    fetch(`http://localhost:5000/${docId}`, {
        method: 'POST',
        body: binary,
        headers: {
            'Content-Type': 'application/octet-stream',
        },
    });
}

function saveCounter(doc) {
    const allChanges = Automerge.getAllChanges(doc);
    allChanges.map((change) => {
        console.log(change);
    });
    const binary = Automerge.save(doc);
    localforage.setItem(counterID, binary);
    return binary;
}

function renderCounter(newDoc) {
    document.getElementById('counter_value').innerHTML = newDoc.buttonClicks;
}

function incrementCounter(counterDocument) {
    return Automerge.change(counterDocument, (counterDocument) => {
        counterDocument.buttonClicks.increment();
    });
}

function decrementCounter(counterDocument) {
    return Automerge.change(counterDocument, (counterDocument) => {
        counterDocument.buttonClicks.decrement();
    });
}

channelCounter.onmessage = function (ev) {
    let payload = ev.data;

    // this message is from the same actor, ignore it
    if (payload.actorId === Automerge.getActorId(counterDocument)) return;
    let newDoc = Automerge.merge(counterDocument, Automerge.load(ev.data));
    counterDocument = newDoc;
    renderCounter(newDoc);
};

document.getElementById('counter_increment').onclick = (ev) => {
    counterDocument = incrementCounter(counterDocument);
    const binary = saveCounter(counterDocument);
    saveCounterToRemote(counterID, binary);
    renderCounter(counterDocument);
    channelCounter.postMessage(binary);
};

document.getElementById('counter_decrement').onclick = (ev) => {
    console.log('HELLLO');
    counterDocument = decrementCounter(counterDocument);
    const binary = saveCounter(counterDocument);
    saveCounterToRemote(counterID, binary);
    renderCounter(counterDocument);
    channelCounter.postMessage(binary);
};

// listener onClick on the button counter
document.getElementById('counter_refresh').onclick = (ev) => {
    loadFromRemote(counterID);
};
