const q=new URLSearchParams(location.search),f=document.getElementById('device');f.width=Number(q.get('width'))||390;f.height=Number(q.get('height'))||844;f.src='/';
