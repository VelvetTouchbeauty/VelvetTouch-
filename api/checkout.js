const crypto=require('crypto');
const {calcular,redis,sha}=require('../lib/shared');
module.exports=async(req,res)=>{
 if(req.method!=="POST")return res.status(405).json({error:"Método no permitido"});
 try{const b=req.body||{},cl=(v,n)=>String(v||"").trim().slice(0,n);
  const name=cl(b.name,80),phone=cl(b.phone,20),city=cl(b.city,80),address=cl(b.address,160);
  if(!name||!phone||!city||!address)return res.status(400).json({error:"Faltan datos de entrega"});
  const o=calcular(Array.isArray(b.items)?b.items.slice(0,50):[],b.code,city);
  const ref="VT"+Date.now().toString(36).toUpperCase()+crypto.randomBytes(2).toString("hex").toUpperCase();
  await redis(["SET","order:"+ref,JSON.stringify({ref,name,phone,city,address,...o}),"EX",604800]);
  const cents=o.total*100,site=process.env.SITE_URL.replace(/\/$/,"");
  const q=new URLSearchParams({"public-key":process.env.WOMPI_PUBLIC_KEY,currency:"COP","amount-in-cents":String(cents),reference:ref,
   "signature:integrity":sha(ref+cents+"COP"+process.env.WOMPI_INTEGRITY_SECRET),"redirect-url":site+"/gracias.html?ref="+ref,"customer-data:full-name":name});
  res.status(200).json({url:"https://checkout.wompi.co/p/?"+q.toString()})
 }catch(e){console.error(e);res.status(400).json({error:e.message})}};
