import STRIPE_KEYS from "./stripe_keys.js";

//console.log(STRIPE_KEYS);

const d = document,
    $pizzas = d.getElementById("pizzas"),
    $template = d.getElementById("pizza-template").content,
    $fragment = d.createDocumentFragment(),
    fetchOptions = {
        headers:{
            Authorization: `Bearer ${STRIPE_KEYS.secret}`
        }
    };

    let products,prices;

    const moneyFormat = (num) => `$${num.slice(0,-2)}.${num.slice(-2)}`;

    Promise.all([
        fetch("https://api.stripe.com/v1/products",fetchOptions),
        fetch("https://api.stripe.com/v1/prices",fetchOptions)
    ])
    .then((responses)=>Promise.all(responses.map(res=>res.json())))
    .then((json)=>{
        //console.log(json);
        products = json[0].data;
        prices = json[1].data;
        console.log(products,prices);

        prices.forEach(el=>{
            let productData = products.filter(product=>product.id === el.product);
            //console.log(productData);

            $template.querySelector("figure").setAttribute("data-price",el.id);
            $template.querySelector("img").src = productData[0].images[0];
            $template.querySelector("img").alt = productData[0].name;
            /*$template.querySelector("figcaption").innerHTML = `
                <div class="title-pizza">${productData[0].name}</div>
                <div class="precio-pizza">${moneyFormat(el.unit_amount_decimal)} ${el.currency}</div>
            `;*/

            $template.querySelector("figcaption").innerHTML = `
                <h3>${productData[0].name}</h3>
                <br>
                <h4>${moneyFormat(el.unit_amount_decimal)} ${el.currency}</h4>
            `;
           
            let $clone = d.importNode($template,true);
            $fragment.appendChild($clone);

        });

        $pizzas.appendChild($fragment);
    })
    .catch((err)=>{
        console.log(err);
        let message = err.statusText || "Ocurrió un error al conectarse con la API de Stripe";
        $pizzas.innerHTML= `<p>Error $${err.status}: ${message}</p>` 

    });


    d.addEventListener("click",(e)=>{
        console.log(e.target);
        if(e.target.matches(".pizza *")){
            let priceId = e.target.parentElement.getAttribute("data-price");
            //console.log(priceId)
            Stripe(STRIPE_KEYS.public).redirectToCheckout({
                lineItems: [{price: priceId, quantity: 1}],
                mode: "subscription",
                successUrl:"http://127.0.0.1:5500/Ejercicio%20API%20129-132/Stripe-success.html",
                cancelUrl:"http://127.0.0.1:5500/Ejercicio%20API%20129-132/Stripe-cancel.html"

            }).then(res => {
                if(res.error){
                    $pizzas.insertAdjacentHTML("afterend",res.error.message);
                }
            })
        }
    })


       




