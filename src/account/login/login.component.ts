import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from 'src/service/api.service';
import { environment } from 'src/environments/environment';

import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public queryParam: any;

  public formGroup: FormGroup;
  public formSubmitted = false;
  public showLoading: boolean = false;

  public loginRedirectUrl: any = `${environment.canvasUrl}/login/oauth2/auth?client_id=${environment.canvasClient_id}&response_type=code&redirect_uri=${environment.redirectUrlAfterLoginIncanvas}`;
  public code: boolean = false;;

  constructor(
    public service: ApiService,
    private router: Router,
    public location: Location,
    public actRoute: ActivatedRoute,
    private cookieService: CookieService
  ) {
    this.formGroup = new FormGroup({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
    });
  }

  ngOnInit() {
    this.queryParam = this.actRoute.snapshot.queryParams;
    this.code = this.queryParam.code;

    if ('code' in this.queryParam) {
        this.service.isAuthenticating = true;
        this.login(this.queryParam.code);
      
    } else {
      window.location.replace(this.loginRedirectUrl);
      // this.router.navigate(['/']);

    }
  }

  public getControls(name: any): FormControl {
    return this.formGroup.get(name) as FormControl;
  }

  login(code: any) {
    let data: any = {
      grant_type: 'authorization_code',
      client_id: environment.canvasClient_id,
      client_secret: environment.canvasClient_secret,
      code: code,
    };

    if(!this.service.userData){
      this.service
        .mainCanvas('login', 'post', data)
        .subscribe((response: any) => {
  
          this.service.token = response.message.access_token;

          this.cookieService.set('access_token', response.message.access_token,1,'/');

          this.service.userData = response.message;
  
          if('profile' in response.message){
            if(response.message.profile.accountType == 'individual'){
              this.service.getEnrolledCourses(response.message.id);
    
            } else if(response.message.profile.accountType == 'company'){
              this.service.isIndividual = false;
  
            } 

          } else {
            this.service.isIndividual = false;
            window.location.replace(environment.baseUrlCanvas)

          }
  
          // check if the redirection
          let state: any = this.location.getState();
  
          if (!state) {
            // start from other page that require the login 
            this.router.navigateByUrl(state.returnUrl, {
              state: state.course,
            });
          } else {
            // or from login button
            this.router.navigate(['/']);
          }
  
          
        });
        
      }

      this.service.isAuthenticating = false;
  }


}
