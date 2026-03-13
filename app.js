
// View Navigation 

const listView = document.getElementById('trip-list-view');
const formView = document.getElementById('trip-form-view');

const btnNewTripTop = document.getElementById('btn-new-trip-top');
const btnCreateFirst = document.getElementById('btn-create-first');
const btnBackToTrips = document.getElementById('btn-back-to-trips');

function showFormView() {
  if (listView && formView) {
    listView.style.display = 'none';
    formView.style.display = 'block';
    window.scrollTo(0, 0); 
  }
}

function showListView() {
  if (listView && formView) {
    formView.style.display = 'none';
    listView.style.display = 'block';
    window.scrollTo(0, 0);
  }
}

if (btnNewTripTop) btnNewTripTop.addEventListener('click', showFormView);
if (btnCreateFirst) btnCreateFirst.addEventListener('click', showFormView);
if (btnBackToTrips) btnBackToTrips.addEventListener('click', showListView);


// ================================
// Participants
// ================================

function addRow(){
const list=document.getElementById('participants-list');

const row=document.createElement('div');
row.className='participant-row';

row.innerHTML=`
<input type="text" placeholder="Participant name">
<button class="delete-btn" onclick="removeRow(this)">🗑️</button>
`;

list.appendChild(row);
}

function removeRow(btn){
const list=document.getElementById('participants-list');

if(list.children.length===1){
list.children[0].querySelector('input').value='';
return;
}

btn.parentElement.remove();
}


// ================================
// Basic Info Date Calculation
// ================================

const startDate=document.getElementById("startDate");
const endDate=document.getElementById("endDate");
const nights=document.getElementById("nights");
const days=document.getElementById("daysCount");

function updateTripLength(){

if(!startDate.value||!endDate.value)return;

const start=new Date(startDate.value);
const end=new Date(endDate.value);

const diff=end-start;
const nightsCount=diff/(1000*60*60*24);

if(nightsCount>=0){
nights.value=nightsCount;
days.value=nightsCount+1;
}

}

startDate?.addEventListener("change",updateTripLength);
endDate?.addEventListener("change",updateTripLength);


// ================================
// Costs (simple version)
// ================================

let categories = [];
let catId = 1;

function addCostCategory() {
  categories.push({
    id: catId++,
    name: "",
    items: [] 
  });
  renderCosts();
}

function renderCosts() {
  const container = document.getElementById("categories-container");
  

  if (categories.length === 0) {
    document.getElementById("empty-state").style.display = "";
    container.innerHTML = "";
    updateGrandTotal();
    return;
  }
  
  document.getElementById("empty-state").style.display = "none";


  container.innerHTML = categories.map(cat => {
    

    const itemsHtml = cat.items.map((item, index) => `
      <div style="display:flex; gap:10px; margin-top:10px; align-items:center;">
        <input type="text" placeholder="Item (e.g., Taxi)" value="${item.name}" onchange="updateCostItem(${cat.id}, ${index}, 'name', this.value)">
        <input type="number" placeholder="Amount ($)" value="${item.amount}" onchange="updateCostItem(${cat.id}, ${index}, 'amount', this.value)" style="width: 150px;">
        <button class="trash" onclick="removeCostItem(${cat.id}, ${index})" style="padding: 10px;">🗑️</button>
      </div>
    `).join("");

   
    const subtotal = cat.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    return `
      <div style="padding:20px; border:1px solid var(--line); border-radius: 12px; margin-bottom: 15px; background: #fafafa;">
        <div style="display:flex; gap:10px; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <input placeholder="Category name (e.g., Flight, Hotel)" value="${cat.name}" onchange="updateCategoryName(${cat.id}, this.value)" style="flex:1; font-weight:bold; background: white;">
          <button class="btn" onclick="removeCategory(${cat.id})">Remove Category</button>
        </div>
        
        <div style="margin-bottom: 15px;">
          ${itemsHtml}
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn-link" onclick="addCostItem(${cat.id})" style="margin:0;">
            <span class="icon">＋</span> Add Cost Item
          </button>
          <div style="font-weight: 600;">Subtotal: $${subtotal.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join("");


  updateGrandTotal();
}


function updateCategoryName(categoryId, newName) {
  const cat = categories.find(c => c.id === categoryId);
  if (cat) cat.name = newName;
}


function addCostItem(categoryId) {
  const cat = categories.find(c => c.id === categoryId);
  if (cat) {
    cat.items.push({ name: "", amount: "" });
    renderCosts();
  }
}


function removeCostItem(categoryId, itemIndex) {
  const cat = categories.find(c => c.id === categoryId);
  if (cat) {
    cat.items.splice(itemIndex, 1);
    renderCosts();
  }
}

function updateCostItem(categoryId, itemIndex, field, value) {
  const cat = categories.find(c => c.id === categoryId);
  if (cat && cat.items[itemIndex]) {
    cat.items[itemIndex][field] = value;
    if (field === 'amount') renderCosts(); 
  }
}


function removeCategory(id) {
  categories = categories.filter(c => c.id !== id);
  renderCosts();
}


function updateGrandTotal() {
  let grandTotal = 0;
  categories.forEach(cat => {
    cat.items.forEach(item => {
      grandTotal += parseFloat(item.amount) || 0;
    });
  });

  const totalFormatted = "$" + grandTotal.toFixed(2);
  
  const badge = document.getElementById("grand-total-badge");
  const text = document.getElementById("grand-total-text");
  
  if(badge) badge.innerText = totalFormatted;
  if(text) text.innerText = totalFormatted;
}

// ================================
// Itinerary
// ================================
 
    const daysEl = document.getElementById("days");

    let trip = {
      days: [
        {
          id: 1,
          name: "Day 1",
          items: []
        }
      ]
    };
    
    function renderTrip() {
      daysEl.innerHTML = "";
    
      trip.days.forEach((day, dayIndex) => {
        const card = document.createElement("div");
        card.className = "day-card";
    
        const itemsHtml = day.items.map((item, itemIndex) => {
          return `
            <div class="schedule-item" style="border:1px solid #ddd; padding:12px; border-radius:10px; margin-top:10px;">
              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
                <input 
                  type="time" 
                  value="${item.time}" 
                  onchange="updateItem(${day.id}, ${itemIndex}, 'time', this.value)"
                >
    
                <input 
                  type="text" 
                  placeholder="Location" 
                  value="${item.location}" 
                  onchange="updateItem(${day.id}, ${itemIndex}, 'location', this.value)"
                >
    
                <input 
                  type="text" 
                  placeholder="Activity" 
                  value="${item.activity}" 
                  onchange="updateItem(${day.id}, ${itemIndex}, 'activity', this.value)"
                >
    
                <input 
                  type="number" 
                  placeholder="Cost" 
                  value="${item.cost}" 
                  onchange="updateItem(${day.id}, ${itemIndex}, 'cost', this.value)"
                >
              </div>
    
              <textarea 
                placeholder="Notes"
                onchange="updateItem(${day.id}, ${itemIndex}, 'notes', this.value)"
                style="width:100%; margin-top:10px; padding:10px; border-radius:8px;"
              >${item.notes}</textarea>
    
              <div style="margin-top:10px;">
                <button onclick="removeItem(${day.id}, ${itemIndex})">Delete Item</button>
              </div>
            </div>
          `;
        }).join("");
    
        card.innerHTML = `
          <div class="day-head" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="day-title">${day.name}</div>
            <button onclick="deleteDay(${day.id})">Delete</button>
          </div>
    
          <div class="day-items">
            ${itemsHtml}
          </div>
    
          <button onclick="addItem(${day.id})" style="margin-top:12px;">Add Schedule Item</button>
        `;
    
        daysEl.appendChild(card);
      });
    }
    
    function addDay() {
      const id = Date.now();
    
      trip.days.push({
        id: id,
        name: `Day ${trip.days.length + 1}`,
        items: []
      });
    
      renderTrip();
    }
    
    function deleteDay(id) {
      if (trip.days.length === 1) {
        trip.days[0].items = [];
        renderTrip();
        return;
      }
    
      trip.days = trip.days.filter(day => day.id !== id);
    
      trip.days.forEach((day, index) => {
        day.name = `Day ${index + 1}`;
      });
    
      renderTrip();
    }
    
    function addItem(dayId) {
      const day = trip.days.find(d => d.id === dayId);
    
      if (!day) return;
    
      day.items.push({
        time: "",
        location: "",
        activity: "",
        cost: "",
        notes: ""
      });
    
      renderTrip();
    }
    
    function removeItem(dayId, itemIndex) {
      const day = trip.days.find(d => d.id === dayId);
    
      if (!day) return;
    
      day.items.splice(itemIndex, 1);
      renderTrip();
    }
    
    function updateItem(dayId, itemIndex, field, value) {
      const day = trip.days.find(d => d.id === dayId);
    
      if (!day || !day.items[itemIndex]) return;
    
      day.items[itemIndex][field] = value;
    }
    
    document.getElementById("addDayBtn").onclick = addDay;
    
    renderTrip();
