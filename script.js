const avatar=document.querySelector('#avatar');
const pupils=document.querySelectorAll('.eye i');
document.addEventListener('mousemove',(event)=>{const rect=avatar?.getBoundingClientRect();if(!rect)return;const dx=(event.clientX-(rect.left+rect.width/2))/window.innerWidth;const dy=(event.clientY-(rect.top+rect.height/2))/window.innerHeight;pupils.forEach(p=>p.style.transform=`translate(${Math.max(-7,Math.min(7,dx*28))}px,${Math.max(-4,Math.min(4,dy*20))}px)`);});
avatar?.addEventListener('mouseenter',()=>avatar.classList.add('hair-float'));
avatar?.addEventListener('mouseleave',()=>avatar.classList.remove('hair-float'));
document.querySelectorAll('.photo-collage img').forEach((image)=>{if(image.src.includes('2025-11-01%20150823.jpg')){image.remove();return;}if(image.parentElement?.tagName==='A')return;const link=document.createElement('a');link.href=image.src;link.target='_blank';link.rel='noreferrer';image.parentNode.insertBefore(link,image);link.appendChild(image);image.addEventListener('error',()=>link.remove());});
const photoWall=document.querySelector('.photo-collage');
if(photoWall){const items=[...photoWall.querySelectorAll(':scope > a')];const portraits=items.filter(item=>item.querySelector('img')?.src.includes('%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87'));const others=items.filter(item=>!portraits.includes(item));const order=[others[0],portraits[0],others[1],others[2],others[3],portraits[1],others[4],others[5],others[6],others[7],portraits[2],...others.slice(8)].filter(Boolean);photoWall.replaceChildren(...order);}
