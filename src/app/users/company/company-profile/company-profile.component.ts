import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EMAIL_REGEX } from '../../../interfaces/app-interface';
import { CompanyService } from '../company-service/company.service';
import { AuthManagerService } from '../../../services/auth-manager.service';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit {
  
  companyProfile = new FormGroup( {
    
                                    email         : new FormControl( {value: '', disabled: true},
                                                                     [ Validators.email,
                                                                       Validators.required, Validators.pattern(
                                                                       EMAIL_REGEX ) ] ),
    
                                    password    : new FormControl( '', [ Validators.required,
                                                                         Validators.minLength( 6 ) ] ),
                                    new_password: new FormControl( '', [
                                      Validators.required, Validators.minLength( 6 ) ] )
                                  }, this.checkSamePass );
  
  //
  errorMessage: string;
  showLoading = false;
  loading_text = 'Please Wait...';
  spinner_mode = 'indeterminate';
  spinner_value = 0;
  
  userData: any;
  
  constructor ( private companyService: CompanyService, private auth: AuthManagerService ) {
  }
  
  checkSamePass ( control: AbstractControl ): { [ key: string]: boolean } {
    
    const old_pass = control.get( 'password' );
    const new_pass = control.get( 'new_password' );
    if (!old_pass.value || !new_pass.value) {
      return null;
    }
    const isSame = new_pass.value !== old_pass.value ? null : {isSame: true};
    if (isSame !== null) {
      control.get( 'new_password' ).setErrors( isSame );
    } else {
      control.get( 'new_password' ).getError( 'minlength' );
    }
    return isSame;
  }
  
  onSubmit () {
    this.showLoading = true;
    this.loading_text = 'Please wait...';
    const data       = this.prepareData();
    console.log( data );
    this.auth.changePassword( data ).subscribe( result => {
      this.loading_text = result.message;
      this.companyProfile.reset();
      setTimeout( () => {
        this.companyProfile.patchValue( this.userData );
        this.showLoading = false;
      }, 2000 );
    }, error2 => {
      console.log( error2 );
      const errMessage = JSON.parse( error2[ '_body' ] );
      console.log( errMessage );
      this.loading_text = 'Oops Something Happened.';
      setTimeout( () => {
        switch (errMessage[ 'exception' ]) {
          case 'mismatch':
            this.loading_text = 'Password Not Correct';
            break;
          
          case 'new_same_as_old':
            this.loading_text = errMessage[ 'message' ];
            break;
          
          case 'email':
            this.loading_text = errMessage[ 'message' ];
            break;
          
          default:
            this.loading_text = 'Opps something happened';
          
        }
      }, 2000 );
      
      setTimeout( () => {
        this.showLoading = false;
      }, 4000 );
    } );
    
  }
  
  prepareData (): object {
    const data = this.companyProfile.value;
    return {
      old_pass: data.password,
      new_pass: data.new_password,
      user    : 'company',
      email   : this.userData[ 'email' ]
    };
  }
  
  ngOnInit () {
    const userData = this.companyService.getLocalStorageData();
    this.userData  = userData;
    this.companyProfile.patchValue( userData );
  }
  
}
