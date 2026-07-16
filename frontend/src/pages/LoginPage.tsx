import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { resolveApiUrl } from '../api/config';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Globe,
  Lock,
  LogIn,
  ShieldCheck,
  User,
  ChevronDown,
  Landmark,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';

import './LoginPage.css';


type Step = 'credentials' | 'twofa';


const LoginPage: React.FC = () => {

  const navigate = useNavigate();

  const [step,setStep] = useState<Step>('credentials');

  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');

  const [showPassword,setShowPassword] = useState(false);

  const [totpCode,setTotpCode] = useState([
    '',
    '',
    '',
    '',
    '',
    ''
  ]);

  const [tempToken,setTempToken] = useState('');

  const [error,setError] = useState('');

  const [loading,setLoading] = useState(false);


  const inputRefs = useRef<(HTMLInputElement|null)[]>([]);



  /*
  ==========================
        VERIFICATION 2FA
  ==========================
  */

  const handleCodeChange = (
    index:number,
    value:string
  )=>{

    if(!/^\d*$/.test(value)) return;


    const newCode=[...totpCode];

    newCode[index]=value.slice(-1);


    setTotpCode(newCode);


    if(value && index < 5){
      inputRefs.current[index+1]?.focus();
    }


    if(newCode.every(x=>x !== '')){
      handleVerify2FA(newCode.join(''));
    }

  };



  const handleCodeKeyDown = (
    index:number,
    e:React.KeyboardEvent
  )=>{

    if(
      e.key==="Backspace" &&
      !totpCode[index] &&
      index>0
    ){
      inputRefs.current[index-1]?.focus();
    }

  };




  const handleVerify2FA = async(code?:string)=>{

    const finalCode = code ?? totpCode.join('');

    if(finalCode.length!==6){

      setError(
        "Entrez les 6 chiffres du code"
      );

      return;
    }


    try{

      setLoading(true);
      setError('');


      const response = await axios.post(

        resolveApiUrl(
          '/api/auth/2fa/verify'
        ),

        {
          code:Number(finalCode)
        },

        {
          headers:{
            Authorization:`Bearer ${tempToken}`
          }
        }

      );


      /*
        IMPORTANT :
        Même stockage que login normal
      */

      localStorage.setItem(
        "token",
        response.data.token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );


      console.log(
        "✅ Authentification 2FA réussie"
      );


      navigate(
        "/",
        {
          replace:true
        }
      );


    }
    catch(error){

      console.error(error);


      setError(
        "Code 2FA incorrect"
      );


      setTotpCode([
        '',
        '',
        '',
        '',
        '',
        ''
      ]);


      inputRefs.current[0]?.focus();

    }
    finally{

      setLoading(false);

    }

  };





  /*
  ==========================
          LOGIN
  ==========================
  */


  const handleLogin = async(
    e:React.FormEvent
  )=>{


    e.preventDefault();


    setLoading(true);
    setError('');


    try{


      const result:any =
        await login(
          username,
          password
        );


      console.log(
        "Réponse login",
        result
      );



      /*
        Cas 2FA activé
      */

      if(result.requiresTwoFactor){


        setTempToken(
          result.tempToken
        );


        setStep('twofa');


        return;

      }




      /*
        LOGIN NORMAL
      */


      localStorage.setItem(
        "token",
        result.token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(result)
      );



      console.log(
        "Utilisateur enregistré"
      );


      navigate(
        "/",
        {
          replace:true
        }
      );



    }
    catch(error){


      console.error(
        error
      );


      setError(
        "Identifiants incorrects"
      );

    }
    finally{

      setLoading(false);

    }


  };





return (

<div className="login-alt">


<aside className="login-hero">


<div className="brand">

<div className="brand-logo-circle">

<Building2 size={28}/>

</div>


<div>

<h1 className="brand-name-main">
PATRIMOINE <span>360</span>
</h1>


<p className="brand-subtitle">
Gestion du Patrimoine
</p>


</div>

</div>



<div className="hero-panel">


<h2 className="hero-headline">

Gérez. Suivez. Valorisez.
<br/>

<span>
Votre patrimoine, en toute simplicité.
</span>

</h2>


<p className="hero-description">

Une solution complète pour une gestion efficace,
transparente et sécurisée de vos biens.

</p>



<div className="feature-list">


<div className="feature-item">

<Landmark size={22}/>

<div>

<h3>
Gestion centralisée
</h3>

<p>
Toutes vos informations patrimoniales au même endroit.
</p>

</div>

</div>




<div className="feature-item">

<BarChart3 size={22}/>

<div>

<h3>
Suivi en temps réel
</h3>

<p>
Suivez vos biens facilement.
</p>

</div>

</div>




<div className="feature-item">

<ShieldCheck size={22}/>

<div>

<h3>
Sécurité renforcée
</h3>

<p>
Vos données sont protégées.
</p>

</div>

</div>



</div>

</div>



</aside>





<main className="login-shell">


<div className="language-selector">

<Globe size={16}/>

Français

<ChevronDown size={14}/>

</div>





<div className="login-card-frame">


<div className="login-glass">



<AnimatePresence mode="wait">


{
step==="credentials"

?

<motion.form

key="login"

onSubmit={handleLogin}

>


<div className="login-header-centered">


<div className="lock-icon-circle">

<Lock size={28}/>

</div>


<h2>
Bienvenue !
</h2>


<p>
Connectez-vous à votre espace
</p>


</div>




{
error &&

<div className="error">

<AlertCircle size={18}/>

{error}

</div>

}




<div className="field">


<label>
Nom utilisateur
</label>


<div className="input-wrap">

<User size={20}/>


<input

value={username}

onChange={
e=>setUsername(e.target.value)
}

required

/>

</div>


</div>





<div className="field">


<label>
Mot de passe
</label>


<div className="input-wrap">


<Lock size={20}/>


<input

type={
showPassword
?'text'
:'password'
}

value={password}

onChange={
e=>setPassword(e.target.value)
}

required

/>



<button

type="button"

onClick={()=>
setShowPassword(!showPassword)
}

>


{
showPassword

?

<EyeOff/>

:

<Eye/>

}

</button>


</div>


</div>




<button

className="btn-connect"

disabled={loading}

>

{

loading

?

"Connexion..."

:

<>

<LogIn size={20}/>

Se connecter

</>

}


</button>



</motion.form>



:


<motion.div

key="2fa"

>


<h2>
Vérification 2FA
</h2>



<div className="otp-grid">


{

totpCode.map(
(digit,index)=>(

<input

key={index}

ref={
el=>inputRefs.current[index]=el
}

maxLength={1}

value={digit}

onChange={
e=>handleCodeChange(
index,
e.target.value
)
}

onKeyDown={
e=>handleCodeKeyDown(
index,
e
)
}

/>

)

)

}


</div>




<button

className="btn-connect"

onClick={()=>
handleVerify2FA()
}

disabled={loading}

>

Vérifier

</button>




<button

className="btn-sso-mock"

onClick={()=>
setStep('credentials')
}

>

<ArrowLeft/>

Retour

</button>



</motion.div>


}


</AnimatePresence>



</div>

</div>


</main>



</div>


);


};


export default LoginPage;