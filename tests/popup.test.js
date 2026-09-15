const assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs");
const scoring=require("../src/scoring"),history=require("../src/history");
const elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{textContent:"",innerHTML:"",style:{},classList:{toggle(){}},addEventListener(){},appendChild(){},disabled:false});return elements.get(id);}
let saved={},pageAvailable=true,networkAvailable=true;
const url="https://example.test/";
const document={getElementById:element,createElement:()=>({}),querySelectorAll:()=>[]};
const chrome={tabs:{query:async()=>[{id:1,url}],sendMessage:async()=>{if(!pageAvailable)throw Error();return {url,protocol:"https:",forms:[],thirdPartyOrigins:[]}}},
cookies:{getAll:async()=>[]},storage:{local:{get:async()=>saved,set:async x=>{saved={...saved,...x}},remove:async k=>{delete saved[k]}}},
runtime:{sendMessage:async m=>m.type==="GET_NETWORK_STATE"?(networkAvailable?{url,headersCaptured:true,statusCode:200,headers:{},redirects:0}:null):{configured:false}}};
const ctx={document,chrome,WebSecScoring:scoring,WebSecHistory:history,URL,console,setTimeout};vm.createContext(ctx);
let source=fs.readFileSync(require.resolve("../src/popup.js"),"utf8");
source=source.slice(0,source.lastIndexOf("analyze(false);"));
vm.runInContext(source,ctx);
(async()=>{
 await vm.runInContext("analyze()",ctx);
 assert.equal(element("saveHistory").disabled,false);
 assert.equal(element("coverage").textContent.startsWith("3/3"),true);
 assert.equal(Object.keys(saved).length,0,"Analysis must not automatically persist");
 await vm.runInContext("saveHistory()",ctx);
 assert.equal(saved[history.KEY].length,1);
 await vm.runInContext("analyze()",ctx);
 assert(element("comparison").textContent.includes("Comparado"));
 await vm.runInContext("clearHistory()",ctx);
 assert.equal(saved[history.KEY],undefined);
 pageAvailable=false;networkAvailable=false;
 await vm.runInContext("analyze()",ctx);
 assert.equal(element("riskBadge").textContent,"PARCIAL");
 assert.equal(element("coverage").textContent.startsWith("1/3"),true);
 console.log("Popup integration passed: analyze, voluntary save, compare, delete and partial coverage.");
})().catch(e=>{console.error(e);process.exitCode=1});
