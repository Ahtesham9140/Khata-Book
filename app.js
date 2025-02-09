document.addEventListener('DOMContentLoaded', function() {
  let persons = JSON.parse(localStorage.getItem('persons')) || [];
  let currentPersonId = null;

  const addPersonForm = document.getElementById('addPersonForm');
  const personNameInput = document.getElementById('personName');
  const personList = document.getElementById('personList');
  const personSearch = document.getElementById('personSearch');
  const personTitle = document.getElementById('personTitle');
  const totalCreditElem = document.getElementById('totalCredit');
  const totalDebitElem = document.getElementById('totalDebit');
  const netBalanceElem = document.getElementById('netBalance');
  const ledgerDiv = document.getElementById('ledger');
  const addEntryForm = document.getElementById('addEntryForm');
  const transactionTypeSelect = document.getElementById('transactionType');
  const itemNameInput = document.getElementById('itemName');
  const paymentInput = document.getElementById('payment');
  const deletePersonBtn = document.getElementById('deletePersonBtn');

  function saveToLocalStorage() {
    localStorage.setItem('persons', JSON.stringify(persons));
  }

  function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  addPersonForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = personNameInput.value.trim();
    if(name) {
      const person = {
        id: generateId(),
        name: name,
        entries: [],
        lastCommitTime: null
      };
      persons.push(person);
      saveToLocalStorage();
      personNameInput.value = '';
      renderPersonList();
    }
  });

  personSearch.addEventListener('input', function() {
    renderPersonList();
  });

  function renderPersonList() {
    const searchTerm = personSearch.value.toLowerCase();
    personList.innerHTML = '';
    const filteredPersons = persons.filter(person => person.name.toLowerCase().includes(searchTerm));

    filteredPersons.forEach(person => {
      const li = document.createElement('li');
      li.textContent = person.name;
      li.dataset.id = person.id;

      if(person.id === currentPersonId) {
        li.classList.add('active');
      }

      li.addEventListener('click', function() {
        currentPersonId = person.id;
        renderPersonList();
        renderLedger();
      });

      personList.appendChild(li);
    });
  }

  function renderLedger() {
    const person = persons.find(p => p.id === currentPersonId);
    if(!person) {
      personTitle.textContent = "Select a Person";
      ledgerDiv.innerHTML = "";
      addEntryForm.style.display = "none";
      deletePersonBtn.style.display = "none";
      totalCreditElem.textContent = 0;
      totalDebitElem.textContent = 0;
      netBalanceElem.textContent = 0;
      return;
    }
    personTitle.textContent = person.name + " (Last commit: " + (person.lastCommitTime ? person.lastCommitTime : "N/A") + ")";
    addEntryForm.style.display = "flex";
    deletePersonBtn.style.display = "inline-block";

    ledgerDiv.innerHTML = "";

    let totalCredit = 0;
    let totalDebit = 0;

    const sortedEntries = person.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedEntries.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'entry';

      const details = document.createElement('div');
      details.innerHTML = "<strong>" + entry.item + "</strong> : " + entry.payment;

      const timeStampDiv = document.createElement('div');
      timeStampDiv.className = 'timestamp';
      timeStampDiv.textContent = entry.timestamp;

      div.appendChild(details);
      div.appendChild(timeStampDiv);

      ledgerDiv.appendChild(div);

      if(Number(entry.payment) > 0) {
        totalCredit += Number(entry.payment);
      } else {
        totalDebit += Number(entry.payment);
      }
    });

    const netBalance = totalCredit + totalDebit;

    totalCreditElem.textContent = totalCredit;
    totalDebitElem.textContent = totalDebit;
    netBalanceElem.textContent = netBalance;
  }

  addEntryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const item = itemNameInput.value.trim();
    let amount = parseFloat(paymentInput.value);
    const transactionType = transactionTypeSelect.value;

    if(item && !isNaN(amount)) {
      if(transactionType === 'withdraw') {
        amount = -Math.abs(amount);
      } else {
        amount = Math.abs(amount);
      }
      const timestamp = new Date().toLocaleString();
      const person = persons.find(p => p.id === currentPersonId);
      if(person) {
        person.entries.push({ item, payment: amount, timestamp });
        person.lastCommitTime = timestamp;
        saveToLocalStorage();
        itemNameInput.value = '';
        paymentInput.value = '';
        renderLedger();
      }
    }
  });

  deletePersonBtn.addEventListener('click', function() {
    if(currentPersonId) {
      if(confirm('Kya aap person file name delete krna chaahate ho?')) {
        persons = persons.filter(p => p.id !== currentPersonId);
        currentPersonId = null;
        saveToLocalStorage();
        renderPersonList();
        renderLedger();
      }
    }
  });

  renderPersonList();
  renderLedger();
});