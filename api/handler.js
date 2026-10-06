import {handleApi} from '../server/api.js';
export default {fetch(request){
 const url=new URL(request.url),route=url.searchParams.get('route');
 if(route){url.pathname='/api/'+route;url.searchParams.delete('route');request=new Request(url,request);}
 return handleApi(request,process.env);
}};
