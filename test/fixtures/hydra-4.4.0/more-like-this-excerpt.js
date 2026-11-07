// Excerpts from Hydra 4.4.0 out/renderer/assets/index-B2nSRQJo.js (MIT, github.com/hydralauncher/hydra), minified;
// each declaration of a comma list is its own statement here. Trimmed for Revamp's patch tests: the stock More like this
// section, the internals it is built from, the catalogue's tag lookup, the Content preferences checkboxes of Settings and the root render. Library code is cut
// down to its declaration; Big Picture's ContentSettingsSection items and its direct tag request are decoys.
var s=Pat();
var c=_0();
const E=Js(c);
const Oat=Js(zat);
function An(){let{isDataRoute:e}=c.useContext(_m);return e?rrt():Got()}
const me=function(e){return{t:e}};
function Jv(e={},t=[]){return[i,o]}
function fn({count:e=1,wrapper:t,className:n,containerClassName:a,containerTestId:i,circle:o=!1,style:r,...l}){return null}
var k0=Kt("ChevronLeftIcon","octicon octicon-chevron-left",function(){return{}});
var Po=Kt("ChevronRightIcon","octicon octicon-chevron-right",function(){return{}});
const kCe=Ed({name:"catalogueSearch",initialState:B2,reducers:{setTags:(e,t)=>{e.steamUserTags=t.payload}}});
const {setFilters:hr,clearFilters:i6t,setPage:o6t,clearPage:X6a,setTags:r6t,setGenres:s6t,setMode:dq}=kCe.actions;
class z6t{values(t){return window.electron.leveldb.values(t)}}
const fa=new z6t;
const wt=l8t.scope("renderer");
function us(e,t,n,a){return e==null?[]:(lu(t)||(t=t==null?[]:[t]),n=n,lu(n)||(n=n==null?[]:[n]),mxt(e,t,n))}
const ii=Wke;
const Gt=tot;
function Do(){const e=ii(),t=Gt(i=>i.library.value),n=Gt(i=>i.library.downloadLibrary),a=c.useCallback(()=>hxt(e),[e]);return{library:t,downloadLibrary:n,updateLibrary:a}}
function BTe({gameTitle:e,coverImageUrls:t,catalogueImages:n,children:a,useClassicsLayout:i=!1,showTitleTooltip:o=!0,className:r,onMouseEnter:l,onMouseLeave:d,...u}){return null}
const Ei=(e,t={})=>{const n=new URLSearchParams({title:e.title,...t}),a=e.catalogueGame??e;return`/game/${a.shop}/${a.objectId}?${n.toString()}`};
async function Y0e(e,t){const n=t.split("-")[0]||"en",a=a4n.has(n)?n:"en",i=a==="en"?["en"]:["en",a],o=await Promise.all(i.map(async l=>{const d=await window.electron.hydraApi.get(e,{params:{language:l},needsAuth:!1});return[l,d]})),r=Object.fromEntries(o);return r[n]??=r[a],r}
function i4n(){const e=ii(),{i18n:t}=me(),d=c.useCallback(async()=>{const[p,h]=await Promise.all([Y0e("/catalogue/steam/tags",t.language),Y0e("/catalogue/steam/genres",t.language)]);e(r6t(p)),e(s6t(h))},[e,t.language]);return{getSteamFilters:d}}
const JX=9;
const pAe=(e,t,n)=>e?t?"loading":n>0?"ready":"empty":"hidden";
const Pxt=async(e,t,n=[])=>{if(!Txt(e.shop)||!e.objectId)return[];const a=await t(`/catalogue/${e.shop}/${encodeURIComponent(e.objectId)}/similar`,{params:{take:JX,downloadSourceIds:n},needsAuth:!1});return Ixt(a,e)};
const hAe=e=>{const[t,n]=c.useState([]),[a,i]=c.useState(!1),[o,r]=c.useState(""),l=c.useRef(0),{objectId:d,shop:u}=e,_=`${u}:${d}`,m=!!d&&(u==="steam"||u==="launchbox");c.useEffect(()=>{const h=++l.current,f={objectId:d,shop:u};if(n([]),r(_),!m){i(!1);return}i(!0);const g=(y,b)=>globalThis.window.electron.hydraApi.get(y,b);return(async()=>{const y=await fa.values("downloadSources");if(h!==l.current)return;const b=us(y,"createdAt","desc").map(x=>x.id),w=await Pxt(f,g,b);h===l.current&&n(w)})().catch(y=>{h===l.current&&(wt.error("Failed to fetch similar games",y),n([]))}).finally(()=>{h===l.current&&i(!1)}),()=>{l.current+=1}},[m,d,_,u]);const p=o===_;return{games:p?t:[],isLoading:m&&(!p||a),isEligible:m}};
const vHe=3;
function yHe({children:e}){return s.jsx("div",{className:"similar-games__slide",children:e})}
function xSn(){return s.jsx("div",{className:"similar-games__carousel","aria-busy":"true",children:s.jsx("div",{className:"similar-games__viewport",children:s.jsx("div",{className:"similar-games__container",children:Array.from({length:vHe},(e,t)=>s.jsx(yHe,{children:s.jsx(fn,{className:"similar-games__skeleton"})},`similar-game-skeleton-${t}`))})})})}
function SSn({objectId:e,shop:t}){const n=An(),{t:a}=me("game_details"),{games:i,isLoading:o,isEligible:r}=hAe({objectId:e,shop:t}),l=pAe(r,o,i.length),[d,u]=Jv({align:"start",containScroll:"trimSnaps",slidesToScroll:vHe,duration:20}),[_,m]=c.useState(!1),[p,h]=c.useState(!1),f=c.useCallback(()=>{m(u?.canScrollPrev()??!1),h(u?.canScrollNext()??!1)},[u]);return c.useEffect(()=>{if(u)return f(),u.on("select",f),u.on("reInit",f),()=>{u.off("select",f),u.off("reInit",f)}},[u,f]),c.useEffect(()=>{u?.scrollTo(0,!0)},[u,e,t]),l==="hidden"?null:s.jsxs("section",{className:"similar-games",children:[s.jsx("h2",{className:"similar-games__title",children:a("similar_games")}),l==="loading"?s.jsx(xSn,{}):null,l==="empty"?s.jsx("div",{className:"similar-games__empty",role:"status",children:a("no_similar_games")}):null,l==="ready"?s.jsx("div",{className:"similar-games__carousel",children:s.jsxs("div",{className:"similar-games__viewport",ref:d,children:[s.jsx("div",{className:"similar-games__container",children:i.map(g=>s.jsx(yHe,{children:s.jsx(BTe,{className:"similar-games__card",gameTitle:g.title,coverImageUrls:[g.coverImageUrl,g.libraryImageUrl,g.iconUrl],useClassicsLayout:g.shop==="launchbox",showTitleTooltip:!1,onClick:()=>n(Ei(g))})},`${g.shop}:${g.objectId}`))}),s.jsx("button",{type:"button",className:"similar-games__control similar-games__control--previous","aria-label":a("previous_media"),disabled:!_,onClick:()=>u?.scrollPrev(),children:s.jsx(k0,{size:36})}),s.jsx("button",{type:"button",className:"similar-games__control similar-games__control--next","aria-label":a("next_media"),disabled:!p,onClick:()=>u?.scrollNext(),children:s.jsx(Po,{size:36})})]})}):null]})}
async function bpFilters(){return await Promise.allSettled([globalThis.window.electron.hydraApi.get("/catalogue/steam/genres",{params:{language:"en"},needsAuth:!1}),globalThis.window.electron.hydraApi.get("/catalogue/steam/tags",{params:{language:"en"},needsAuth:!1})])}
function _n({label:e,indeterminate:t=!1,id:n,...a}){const i=c.useId(),o=n??i;return null}
function TAn(){const{t:e}=me("settings"),u=U1e(d),v=t;return s.jsxs("div",{className:"settings-context-panel",children:[s.jsxs("div",{className:"settings-context-panel__group",children:[s.jsx("h3",{children:e("content_preferences")}),s.jsx(_n,{label:e("autoplay_trailers_on_game_page"),checked:u.autoplayGameTrailers,onChange:()=>v({autoplayGameTrailers:!u.autoplayGameTrailers})}),s.jsx(_n,{label:e("persist_filters_and_sorting"),checked:u.persistFiltersAndSorting,onChange:()=>v({persistFiltersAndSorting:!u.persistFiltersAndSorting})})]})]})}
function Iha(){const{t}=me("settings"),r=l,p=d;return[{id:"persist-filters-and-sorting",focusId:_r.persistFiltersAndSorting,label:t("persist_filters_and_sorting"),checked:r.persistFiltersAndSorting,onChange:P=>void p({persistFiltersAndSorting:P})}]}
Oat.createRoot(document.getElementById("root")).render(s.jsx(E.StrictMode,{children:s.jsx(qke,{store:LXt,children:s.jsx(cBt,{})})}));
