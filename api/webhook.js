const {verificar}=require('../lib/shared');
module.exports=async(req,res)=>{
 const evt=req.body;
 if(!evt||!verificar(evt,process.env.WOMPI_EVENTS_SECRET))return res.status(401).json({error:"Firma inválida"});
 const t=evt.data&&evt.data.transaction;
 if(evt.event==="transaction.updated"&&t&&t.status==="APPROVED")console.log("Pago aprobado",t.reference,t.amount_in_cents/100);
 res.status(200).json({ok:true})};
