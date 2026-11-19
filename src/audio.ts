type Voice=[number,number,number,OscillatorType,number?];
const voices:Record<string,Voice[]> = {
  charge:[[150,285,.085,'sine']], fire:[[170,58,.16,'triangle'],[500,155,.09,'sine']],
  wall:[[660,470,.048,'sine']], mirror:[[980,1340,.12,'sine'],[1470,1200,.07,'triangle']],
  crystal:[[1140,700,.095,'sine']], armor:[[125,67,.09,'square']], conductor:[[410,720,.09,'triangle']],
  core:[[260,104,.13,'sine']], pulse:[[520,780,.11,'sine']], chain:[[330,440,.22,'triangle']],
  destroy:[[620,88,.19,'triangle']], fracture:[[220,45,.2,'sawtooth']],
  won:[[392,392,.24,'sine'],[494,494,.25,'sine',.09],[587,587,.29,'sine',.18],[784,784,.44,'triangle',.27]],
  lost:[[260,210,.22,'sine'],[172,103,.4,'triangle',.18]], menu:[[450,600,.065,'sine']],
  breach:[[190,95,.19,'triangle']], overload:[[740,1110,.28,'sine'],[980,1480,.32,'sine',.1]]
};
export class AudioBus {
  context:AudioContext|null=null;
  master:GainNode|null=null;
  enabled=false;
  volume=.55;
  last=new Map<string,number>();
  serial=0;
  unlock(){
    if(!this.enabled)return;
    try{
      if(!this.context){
        this.context=new AudioContext();
        this.master=this.context.createGain();
        const limiter=this.context.createDynamicsCompressor();
        this.master.connect(limiter);limiter.connect(this.context.destination);
      }
      this.level(this.volume);
      void this.context.resume().catch(()=>{});
    }catch{/* Device audio is optional. */}
  }
  level(value:number){this.volume=value;if(this.master&&this.context)this.master.gain.setTargetAtTime(this.enabled?value:0,this.context.currentTime,.025);}
  play(name:string,step=0){
    const ctx=this.context;
    if(!this.enabled||!ctx||ctx.state!=='running'||!this.master)return;
    const now=ctx.currentTime;
    if(now-(this.last.get(name)??-1)<(name==='wall'?.065:.032))return;
    this.last.set(name,now);
    const variation=1+Math.sin(++this.serial*2.3)*.018;
    for(const [from,to,length,wave,offset=0] of voices[name]||[]){
      const start=now+offset,osc=ctx.createOscillator(),amp=ctx.createGain();
      const pitch=variation*(name==='pulse'?Math.pow(2,Math.min(step,8)/12):1);
      osc.type=wave;osc.frequency.setValueAtTime(from*pitch,start);osc.frequency.exponentialRampToValueAtTime(to*pitch,start+length);
      const peak=wave==='square'||wave==='sawtooth'?.045:name==='wall'?.055:.14;
      amp.gain.setValueAtTime(.0001,start);amp.gain.exponentialRampToValueAtTime(peak,start+.008);amp.gain.exponentialRampToValueAtTime(.0001,start+length);
      osc.connect(amp);amp.connect(this.master);osc.start(start);osc.stop(start+length+.01);
      osc.onended=()=>{osc.disconnect();amp.disconnect();};
    }
  }
}
