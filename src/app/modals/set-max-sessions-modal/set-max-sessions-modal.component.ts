import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-set-max-sessions-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './set-max-sessions-modal.component.html',
  styleUrls: ['./set-max-sessions-modal.component.scss'],
  standalone: true
})
export class SetMaxSessionsModalComponent {
  userId!: number;
  maxSessionsPerMonth!: number;
  form: FormGroup;
  loading = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      maxSessionsPerMonth: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.form.patchValue({ maxSessionsPerMonth: this.maxSessionsPerMonth });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please select a valid number.');
      return;
    }

    this.loading = true;
    this.userService.updateUser(this.userId, { maxSessionsPerMonth: this.form.get('maxSessionsPerMonth')?.value }).subscribe({
      next: () => {
        this.toastr.success('Number of max sessions updated successfully.');
        this.loading = false;
        this.modal.close(true);
      },
      error: () => {
        this.toastr.error('Failed to update the number of max sessions.');
        this.loading = false;
      }
    });
  }

  cancel() {
    this.modal.dismiss();
  }
}
