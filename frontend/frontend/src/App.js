import {Routes, Route} from 'react'
import Layout from './components/Layout'
function App(){
    return(
        <Routes>
            <Route path="/" element = {<Layout/>}> 
            </Route>
        </Routes>
    );
}
export default App;