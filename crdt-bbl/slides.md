---
theme: the-unnamed
---

# Local-First et CRDTs

Une approche pour une connectivité sans compromis ?

---
transition: fade-out
---

# 7 idéals

Les défenseurs de la local-first remontent 7 idéals en faveur du local-first:
<v-clicks>

- 🔃 **No-Spinner** - Pourquoi c'est plus lent ?
- 📱 **Multi-device** - Je suis apple, je suis android, je suis windows, je suis linux, je suis chromebook, je suis ...
- 📴 **Network optionel** - J'habite dans la meuse, c'est grave ?
- 👨‍👩‍👧‍👧 **Collaboration** - Ah, je ne suis pas seul sur Terre ?
- ⏳ **The Long Now** - Et dans 30 ans ?
- 🔐 **Securité** - Mes nudes ont été piratées !
- 🛠 **Propriété** - Google a vendu mes données !

</v-clicks>




<!--
No-Spinner: Nous évloluons dans les technos, avons des machines plus puissante, mais dès qu'on fait une action on voit un spinner. C'est un peu comme si on avait un ordinateur de 1990 et qu'on attendait 10 secondes pour afficher une page web. Ce n'est pas normal.
Meme si certains font de l'optimisting-rendering, pourquoi ne pas aller plus loin et ne pas avoir de spinner du tout ?

Multi-device: Une application ne devrait pas être liée à un seul appareil. On peut avoir un ordinateur, un téléphone, une tablette, un smartwatch, etc. On devrait pouvoir utiliser l'application sur n'importe quel appareil.

Network optionel: Unea application ne doit pas etre dépandante d'une connexion internet. On peut avoir des applications qui fonctionnent en local, et qui peuvent se synchroniser avec le cloud quand on a une connexion internet.

Collaboration: Dans la plupart des applis, on ne peut pas travailler en meme temps sur le meme document. On doit attendre que l'autre finisse. Si jamais c'est le cas, on peut rentrer dans un cas de conflit. L'idéal serait de pouvoir travailler en meme temps sur le meme document, et de pouvoir résoudre les conflits. C'est la partie la plus dur du local-first.

The Long Now: Prenons le cas des notes. J'utilise Notion, et je peux écrire des notes. Mais est-ce que j'aurais toujorus accès à ces notes dans 10 ans ?

Securité: On peut avoir des données sensibles, et on ne veut pas que ces données soient piratées. Déja le fait d'avoir tout en local aide. On pourait stocker nos données en  local, et avoir un backup encrypté sur le cloud.

Propriété: Et si demain Notion décide de vendre mes notes ??? On ne devrait pas être dépendant d'une entreprise pour avoir accès à nos données.
-->

---
transition: slide-up
---


# Un 8 idéal
>  Dans l'utilisation d'une application web, la communication réseau représente un tiers de la moitié, quelque chose comme ça, fin regarde ma conférence sur le sujet.
>
<cite>François Z. à Anthony R.</cite>


<br>
<br>
<br>

Plus on limite les appels réseau, plus on diminue la  consommation de données, et donc plus on diminue l'empreinte carbone.
Tendre vers le local-first, c'est tendre vers une application plus verte. (merci Copilot)

---
transition: slide-up
layout: center
---


# Sauvegarder les données

<img src="/assets/controled.png" style="max-width:600px">


Réplication fortement cohérente


<!--Dans une application hors ligne en premier lieu, chaque client dispose de sa propre base de données. Chacun peut réaliser ses modifications de manière isolée. Et s'il le souhaite, il peut les synchroniser avec un serveur distant ou avec un autre client. Cette approche permet d'obtenir des performances et une disponibilité maximales, mais elle peut entraîner des conflits lorsque plusieurs clients ou utilisateurs modifient simultanément le même élément de données. On parle donc de "réplication optimiste".
Dans une application classique, les données sont envoyées à un serveur puis stockées dans une base de données. Pour effectuer une modification ou envoyer une donnée, il faut réaliser une requête HTTP. Et c'est le serveur qui gère les transactions et leur ordre pour s'assurer que tout le monde dispose de la même vérité. Nous sommes sur un système de "réplication fortement cohérente".
-->

---
transition: slide-up
layout: center
---


# Sauvegarder les données

<img src="/assets/optimiste.png" style="max-width:600px">

Réplication optimiste


<!--
Dans une application hors ligne en premier lieu, chaque client dispose de sa propre base de données. Chacun peut réaliser ses modifications de manière isolée. Et s'il le souhaite, il peut les synchroniser avec un serveur distant ou avec un autre client. Cette approche permet d'obtenir des performances et une disponibilité maximales, mais elle peut entraîner des conflits lorsque plusieurs clients ou utilisateurs modifient simultanément le même élément de données. On parle donc de "réplication optimiste".
-->

---
transition: slide-up
---


# Problèmes

La réplication optimiste cependant introduit 2 problèmes. 
- Unreliable ordering: Quand ?
- Conflicts: Qui a raison ?

<img src="/assets/cry.png" style="max-width:200px; position: absolute; right: 20px; bottom: 10px">

---
transition: slide-up
---

# CRDT

Les CRDT (Conflict-free Replicated Data Types) sont des types de données qui peuvent être modifiés de manière concurrente par plusieurs clients, et qui peuvent être synchronisés de manière transparente entre les clients.
Ce modele a été défini en 2011. Et il permet de résoudre les problèmes de réplication optimiste.

<img src="/assets/crdt.png" style="max-width:600px">


---
transition: slide-up
---

# Unreliable ordering

L'ordre dans lequel les événements se produisent n'est pas déterministe ou ne peut pas être garanti de manière fiable. 

<img src="/assets/sync.png" style="max-width:300px">

<!-->
If I edit an object on one device, and then edit that same object on another device, and then sync both devices together. I want to be 100% confident that both devices see those edits in the exact same order. This is what allows “conflict free” in CRDT. Distributed clocks provide this guaranteed ordering agreement.
-->

---
transition: slide-up
---

# Clocks 

Une solution est d'ajouter un système de clocks. C'est ni plus ni moins qu'un horodatage.

<v-clicks>

- Last Write Wins
- World Clock
- Lamport Clocks (incrémentation)
- Vector Clocks (incrémentation par client)

</v-clicks>

---
transition: slide-up
---

# Conflicts

Les conflits sont des cas où deux clients modifient le même objet de manière concurrente.

<img src="/assets/conflit.png" style="max-width:400px">

<v-clicks>

- Values
- Counters
- Lists
- Text

</v-clicks>

<!--->
The CRDT structure registers these changes as an update operation, so that when there is a network communication available between the two devices they can exchange their corresponding updates and merge them to reach a common state of their data structure.

Chaque changement est enregistré et stocké dans l'object

The only type of change that a CRDT cannot automatically resolve is when multiple users concurrently update the same property of the same object; in this case, the CRDT keeps track of the conflicting values, and leaves it to be resolved by the application or the user.
-->

---
transition: slide-up
---

# Implémentation

Differente librairies existent pour implémenter les CRDT.
Pour ma part je suis partie sur Automerge. 


````js
counterDocument = Automerge.init();
counterDocument = Automerge.change(counterDocument, (doc) => {
    // The counter is initialized to 0 by default. You can pass a number to the
    // Automerge.Counter constructor if you want a different initial value.
    doc.buttonClicks = new Automerge.Counter();
});

function incrementCounter() {
    counterDocument = Automerge.change(counterDocument, (doc) => {
        doc.buttonClicks.increment();
    });
    render();
}

function saveCounter(doc) {
    const binary = Automerge.save(doc);
    localforage.setItem(counterID, binary);
    return binary;
}
````

---
transition: slide-up
---

# Exemple

https://demos.yjs.dev/quill/quill.html

---
transition: slide-up
layout: center
---

# Conclusion

<!-->
5 avantages de l'utilisation des CRDTs dans le local-first :

Réduction des conflits de synchronisation : Les CRDTs permettent de synchroniser les données entre les appareils de manière asynchrone, sans avoir besoin d'un point centralisé de synchronisation. Cela réduit le risque de conflits de synchronisation et garantit que les données sont toujours à jour sur tous les appareils.

Travail hors ligne possible : Les CRDTs permettent aux utilisateurs de travailler hors ligne sans aucune interruption. Les modifications apportées aux données sont stockées localement et peuvent être synchronisées avec d'autres appareils dès qu'une connexion Internet est disponible.

Meilleure résilience : Les CRDTs permettent de récupérer facilement des données après une panne du système ou une perte de connexion Internet. Les données sont répliquées sur plusieurs appareils, ce qui garantit que les informations ne sont pas perdues même si un appareil est endommagé ou perdu.

Partage de données en temps réel : Les CRDTs permettent de partager les données en temps réel, ce qui est particulièrement utile pour les applications de collaboration en temps réel, telles que la messagerie instantanée, la co-édition de documents ou la gestion de projet.
Sécurité des données : Les CRDTs permettent de stocker les données localement, ce qui offre une meilleure sécurité des données. Les utilisateurs ont un contrôle total sur leurs données et peuvent décider des données à partager et de celles à garder privées.

5 inconvénients potentiels de l'utilisation des CRDTs dans le local-first :
Complexité de mise en œuvre : La mise en œuvre des CRDTs peut être complexe et exigeante en termes de développement. 

Augmentation de la taille des données : Les CRDTs peuvent augmenter la taille des données stockées localement, ce qui peut poser des problèmes de stockage sur les appareils avec des capacités de stockage limitées.

Difficulté de la résolution des conflits : Bien que les CRDTs réduisent les conflits de synchronisation, ils ne les éliminent pas complètement. La résolution des conflits peut être difficile et exiger une certaine expertise.
-->