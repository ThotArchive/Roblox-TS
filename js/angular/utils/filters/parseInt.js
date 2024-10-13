import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

angularJsUtilitiesModule.filter("parseInt", ()=> {
    return (input, radix)=> {
        // Default radix is 10
        const parsedInput = parseInt(input, radix ? radix : 10);

        return Number.isNaN(parsedInput) ? input : parsedInput
    }
});

export default parseInt;