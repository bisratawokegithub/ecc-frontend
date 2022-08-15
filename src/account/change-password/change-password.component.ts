import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/service/api.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  public formGroup: FormGroup;
  public formSubmitted = false;
  public showLoading: boolean = false;
  public passwordChangeSuccess: Boolean = false;
  public passwordChangeErrors: any[] = [];

  constructor(public service: ApiService, private router: Router) {
    this.formGroup = new FormGroup({
      password: new FormControl(null, [Validators.required]),
      repassword: new FormControl(null, Validators.required),
    });
  }

  ngOnInit() {}

  public getControls(name: any): FormControl {
    return this.formGroup.get(name) as FormControl;
  }

  Submit() {
    if (!this.formGroup.valid) {
      return;
    } else {
      if (
        this.getControls('password').value !==
        this.getControls('repassword').value
      ) {
        this.passwordChangeErrors = [];
        this.passwordChangeErrors.push({
          message: 'Password is not the same.',
        });
        this.passwordChangeSuccess = false;
      } else {
        this.showLoading = true;

        const formData = new FormData();

        formData.append('users[0][id]', this.service.userData.userid);
        formData.append(
          'users[0][password]',
          this.getControls('password').value
        );

        formData.append('wstoken', environment.adminToken);
        formData.append('wsfunction', 'core_user_update_users');
        formData.append('moodlewsrestformat', 'json');

        this.service.main(formData).subscribe((response: any) => {
          if (!response.warnings.length) {
            this.formGroup.reset();
            this.passwordChangeSuccess = true;
            this.passwordChangeErrors = [];
          } else {
            this.passwordChangeErrors = [];
            this.passwordChangeSuccess = false;
            this.passwordChangeErrors = response.warnings;
          }

          this.showLoading = false;
        });
      }
    }
  }
}
