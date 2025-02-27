'use client';


export function BasicCreate() {


  return (
    <div className={'space-y-6'}>
      <h1>Basic UI</h1>
    </div>
  )

}

export function BasicProgram() {
 
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
