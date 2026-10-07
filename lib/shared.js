const crypto=require('crypto');
const cat=require('./catalog.json');
const DOS=["The Ordinary","Medicube"];
const ZA=["Bogotá D.C.","Medellín","Cali","Barranquilla","Cartagena","Bucaramanga","Pereira","Manizales","Armenia","Envigado","Bello","Itagüí","Soacha","Chía","Floridablanca","Dosquebradas","Jamundí","Palmira"];
const ZC=["Tumaco","Quibdó","Florencia","Riohacha","Yopal","Maicao","Arauca","San Andrés"];
const COSTOS={A:11000,B:15000,C:25000};
// Fin de Black Days: cámbialo también en index.html (BLACK_END)
const BLACK_END=new Date("2026-10-27T23:59:59-05:00");
const fin=p=>p.off&&Date.now()<=BLACK_END.getTime()?p.pr*(1-p.off/100):p.pr;
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
function zona(c){const n=String(c).split(" (")[0];return ZA.includes(n)?"A":ZC.includes(n)?"C":"B"}
// Recalcula TODO en el servidor: nunca se confía en los precios que manda el navegador.
function calcular(items,code,city){
 let s=0,d2=0;const lines=[];
 for(const it of items){const p=cat[parseInt(it.id)];if(!p)throw new Error("Producto inválido");
  const q=Math.min(Math.max(parseInt(it.qty)||0,0),20);if(!q)continue;
  s+=fin(p)*q;if(DOS.includes(p.br)&&p.cat==="Skincare")d2+=Math.floor(q/2)*fin(p);
  lines.push(`• ${q} x ${p.br} ${p.nm}${it.shade?` (Tono: ${String(it.shade).slice(0,30)})`:""}`)}
 if(!lines.length)throw new Error("El carrito está vacío");
 const disc=String(code||"").trim().toUpperCase()==="BELLA10"?0.1:0;
 const d=(s-d2)*disc+d2,sub=s-d,envio=sub>=250000?0:COSTOS[zona(city)];
 return{lines,subtotal:Math.round(s),descuento:Math.round(d),envio,total:Math.round(sub)+envio}}
// Verifica que el evento realmente venga de Wompi
function verificar(evt,secret){try{const vals=evt.signature.properties.map(p=>p.split(".").reduce((o,k)=>o&&o[k],evt.data));
 return sha(vals.join("")+evt.timestamp+secret)===evt.signature.checksum}catch(e){return false}}
async function redis(cmd){const r=await fetch(process.env.UPSTASH_REDIS_REST_URL,{method:"POST",headers:{Authorization:"Bearer "+process.env.UPSTASH_REDIS_REST_TOKEN},body:JSON.stringify(cmd)});
 const j=await r.json();if(j.error)throw new Error(j.error);return j.result}
async function avisarWhatsApp(msg){
 const u=`https://api.callmebot.com/whatsapp.php?phone=${process.env.CALLMEBOT_PHONE}&text=${encodeURIComponent(msg)}&apikey=${process.env.CALLMEBOT_APIKEY}`;
 const r=await fetch(u);if(!r.ok)throw new Error("WhatsApp falló: "+r.status)}
module.exports={calcular,verificar,redis,avisarWhatsApp,sha,fin};
