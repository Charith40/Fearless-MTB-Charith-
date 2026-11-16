const collections = [
  ['cycling-pedals', 'Cycling Pedals', [['trail-composite','Trail Composite Flats'],['ridge-alloy','Ridge Alloy Flats'],['wide-platform','Wide Platform Flats']]],
  ['stickers', 'Stickers', [['fearless-logo','Fearless Logo Pack'],['trail-lines','Trail Lines Sticker Pack'],['frame-decal','Frame Decal Kit']]],
  ['handlebars', 'Handlebars', [['trail-low-rise','Trail Low-Rise Bar'],['enduro-riser','Enduro Riser Bar'],['high-rise','High-Rise Alloy Bar']]],
  ['bike-grips', 'Bike Grips', [['slim-lock-on','Slim Lock-On Grips'],['trail-ridge','Trail Ridge Grips'],['thick-lock-on','Thick Lock-On Grips']]]
]
const products = collections.flatMap(([category,,items]) => items.map(([id,name]) => ({id,name,category})))
const byId = new Map(products.map(p => [p.id,p]))
const main = document.querySelector('main')
const dialog = document.querySelector('dialog')
const nav = document.querySelector('nav')
const menu = document.querySelector('#menu')
const storageKey = 'fearless-mtb-cart-v1'
let quantity = 1
let cart = readCart()
function readCart(){
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return Object.fromEntries(Object.entries(data).filter(([id,n]) => byId.has(id) && Number.isSafeInteger(n) && n>0))
  } catch { return {} }
}
function total(){return Object.values(cart).reduce((sum,n)=>sum+n,0)}
function updateCount(){document.querySelector('#count').textContent=total()}
function save(){
  try {localStorage.setItem(storageKey,JSON.stringify(cart))} catch {}
  updateCount()
}
function photo(id,view='full'){return 'assets/'+id+'-'+view+'.jpg'}
function card(id,label,href){
  return `<a class="card" href="${href}"><img alt="" src="${photo(id)}"><h3>${label}</h3></a>`
}
function productCard(p){return card(p.id,p.name,'#/product/'+p.id)}
function home(){
  return `<section class="hero"><img src="assets/rider.jpg" alt="A mountain biker riding a forest trail"><div class="hero-text"><h1>Ride with no fear</h1><a class="button" href="#/shop">Shop all parts</a></div></section>
  <section class="section"><h2>Shop by category</h2><div class="grid">${collections.map(([id,label,items])=>card(items[0][0],label,'#/shop/'+id)).join('')}</div></section>
  <section class="section"><h2>Featured parts</h2><div class="grid">${collections.map(c=>productCard(byId.get(c[2][0][0]))).join('')}</div></section>`
}
function shop(c){
  const tabs=[['','All parts'],...collections]
  return `<h1>${c?c[1]:'Shop all parts'}</h1><div class="filters" aria-label="Filter by category">${tabs.map(([id,label])=>`<a href="#/shop${id?'/'+id:''}" ${id===(c?.[0]||'')?'aria-current="page"':''}>${label}</a>`).join('')}</div><div class="grid">${products.filter(p=>!c||c[0]===p.category).map(productCard).join('')}</div>`
}
function stepper(id,n){
  const name=byId.get(id).name
  return `<div class="qty"><button data-action="minus" data-id="${id}" aria-label="Decrease quantity of ${name}" ${n<=1?'disabled':''}>−</button><output aria-label="Quantity">${n}</output><button data-action="plus" data-id="${id}" aria-label="Increase quantity of ${name}">+</button></div>`
}
function detail(p){
  const c=collections.find(c=>c[0]===p.category)
  return `<a class="back" href="#/shop/${c[0]}">← ${c[1]}</a><section class="product"><div><img class="photo" src="${photo(p.id)}" alt="${p.name}, full view"><div class="thumbs">${['full','left','right'].map((view,i)=>`<button data-view="${view}" data-id="${p.id}" aria-label="Show ${view} view" aria-pressed="${i===0}"><img src="${photo(p.id,view)}" alt=""></button>`).join('')}</div></div><div><h1>${p.name}</h1><span class="label">Quantity</span>${stepper(p.id,quantity)}<div class="purchase"><button class="button" data-action="add" data-id="${p.id}">Add to cart</button></div></div></section>`
}
function cartPage(){
  const rows=Object.entries(cart).map(([id,n])=>{
    const p=byId.get(id)
    return `<article class="row"><a href="#/product/${id}" aria-label="${p.name}"><img src="${photo(id)}" alt=""></a><a href="#/product/${id}"><h3>${p.name}</h3></a>${stepper(id,n)}<button class="remove" data-action="remove" data-id="${id}" aria-label="Remove ${p.name}">Remove</button></article>`
  })
  return rows.length?`<h1>Your cart</h1>${rows.join('')}<div class="cartend"><strong>Total items: ${total()}</strong><a class="button" href="#/shop">Continue shopping</a></div>`:'<h1>Your cart is empty</h1><div class="empty"><a class="button" href="#/shop">Browse products</a></div>'
}
function render(){
  const [page,id]=location.hash.replace(/^#\/?/,'').split('/')
  const category=collections.find(c=>c[0]===id)
  quantity=1
  nav.classList.remove('open')
  menu.setAttribute('aria-expanded','false')
  if(dialog.open)dialog.close()
  if(!page)main.innerHTML=home()
  else if(page==='shop'&&(!id||category))main.innerHTML=shop(category)
  else if(page==='product'&&byId.has(id))main.innerHTML=detail(byId.get(id))
  else if(page==='cart')main.innerHTML=cartPage()
  else main.innerHTML='<h1>Page not found</h1><a class="back" href="#/">Return home</a>'
  document.title=(main.querySelector('h1')?.textContent || 'Shop')+' | Fearless MTB'
  updateCount()
}
nav.innerHTML=collections.map(([id,name])=>`<a href="#/shop/${id}">${name}</a>`).join('')
menu.onclick=()=>menu.setAttribute('aria-expanded',String(nav.classList.toggle('open')))
nav.onclick=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}
document.querySelector('#stay').onclick=()=>dialog.close()
main.addEventListener('click',event=>{
  const button=event.target.closest('button')
  if(!button)return
  const {id,view,action}=button.dataset
  if(!byId.has(id))return
  if(view){
    const image=main.querySelector('.photo')
    image.src=photo(id,view)
    image.alt=byId.get(id).name+', '+view+' view'
    main.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))
    return
  }
  if(action==='add'){
    cart[id]=(cart[id]||0)+quantity
    save()
    document.querySelector('#added').textContent=quantity+' × '+byId.get(id).name
    dialog.showModal()
    return
  }
  if(location.hash==='#/cart'){
    if(action==='remove')delete cart[id]
    else cart[id]=Math.max(1,cart[id]+(action==='plus'?1:-1))
    save()
    main.innerHTML=cartPage()
    return
  }
  quantity=Math.max(1,quantity+(action==='plus'?1:-1))
  main.querySelector('output').textContent=quantity
  main.querySelector('[data-action="minus"]').disabled=quantity===1
})
window.addEventListener('storage',e=>{
  if(e.key===storageKey||e.key===null){cart=readCart();updateCount();if(location.hash==='#/cart')main.innerHTML=cartPage()}
})
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);main.focus({preventScroll:true})})
render()
document.querySelector('.skip').onclick=event=>{
  event.preventDefault()
  main.focus()
}
