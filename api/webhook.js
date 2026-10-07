const {verificar,redis,avisarWhatsApp}=require('../lib/shared');
const cop=n=>"$"+Number(n).toLocaleString("es-CO");
module.exports=async(req,res)=>{
 const evt=req.body;
 if(!evt||!verificar(evt,process.env.WOMPI_EVENTS_SECRET))return res.status(401).json({error:"Firma inválida"});
 try{const t=evt.data&&evt.data.transaction;
  if(evt.event==="transaction.updated"&&t&&t.status==="APPROVED"){
   const nuevo=await redis(["SET","paid:"+t.reference,"1","NX","EX",604800]);
   if(nuevo){try{
    const raw=await redis(["GET","order:"+t.reference]),o=raw?JSON.parse(raw):null;
    const msg=o?`✅ NUEVO PEDIDO PAGADO 💗\nRef: ${o.ref}\n\n${o.lines.join("\n")}\n\nTotal: ${cop(o.total)} (envío ${o.envio?cop(o.envio):"gratis"})\n${o.total*100!==t.amount_in_cents?"⚠ REVISAR: el monto pagado no coincide\n":""}\nCliente: ${o.name}\nCelular: ${o.phone}\nCiudad: ${o.city}, Colombia\nDirección: ${o.address}`
     :`✅ Pago aprobado ${t.reference} por ${cop(t.amount_in_cents/100)}, pero no encontré el pedido. Revisa en Wompi.`;
    await avisarWhatsApp(msg)}catch(e){await redis(["DEL","paid:"+t.reference]);throw e}}}
  res.status(200).json({ok:true})
 }catch(e){console.error(e);res.status(500).json({error:"Error interno"})}};
