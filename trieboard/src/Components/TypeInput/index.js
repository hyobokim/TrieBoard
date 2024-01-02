import { useState } from "react";
import './index.css'

const TypeInput = (props) => {
    const [inputValue, setInputValue] = useState('');

    const updateInput = (e) => {
        const letters = /^[A-Za-z]+$/;

        if (e.target.value.match(letters) || e.target.value === "") {
            setInputValue(e.target.value);
        }

        // Reset value when space is clicked
        if (e.target.value.slice(-1) === ' ') {
            setInputValue('')
        } 

        props.handler(e);
    }

    return <span>
        <input className="type-input" value={inputValue} type="text" placeholder="Start typing..." autoFocus onChange={(e) => updateInput(e)}/>
    </span>
};

export default TypeInput;