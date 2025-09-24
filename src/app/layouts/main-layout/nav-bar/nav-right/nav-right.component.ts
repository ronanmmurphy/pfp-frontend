// angular import
import { Component, inject, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// project import

// icon
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Subject, takeUntil, tap } from 'rxjs';
import { UserRole } from 'src/app/enums/user.enum';
import { AuthService } from 'src/app/services/auth.service';
import { getRoleText } from 'src/app/utils/user.helper';

@Component({
  selector: 'app-nav-right',
  imports: [IconDirective, RouterModule, NgScrollbarModule, NgbNavModule, NgbDropdownModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  private iconService = inject(IconService);

  styleSelectorToggle = input<boolean>();
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;

  name: string = '';
  role: string = '';
  private destroyed$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline
      ]
    );
  }

  profile = [
    {
      icon: 'edit',
      title: 'Edit Profile',
      url: '/profile'
    }
    // {
    //   icon: 'user',
    //   title: 'View Profile'
    // },
    // {
    //   icon: 'profile',
    //   title: 'Social Profile'
    // },
    // {
    //   icon: 'wallet',
    //   title: 'Billing'
    // }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    // {
    //   icon: 'user',
    //   title: 'Account Settings'
    // },
    {
      icon: 'lock',
      title: 'Privacy Center'
    }
    // {
    //   icon: 'comment',
    //   title: 'Feedback'
    // },
    // {
    //   icon: 'unordered-list',
    //   title: 'History'
    // }
  ];

  ngOnInit() {
    this.authService.currentUser$
      .pipe(
        tap((u) => {
          this.name = u.firstName + ' ' + u.lastName;
          this.role = getRoleText(u.role);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
