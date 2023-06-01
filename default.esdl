module auth {
  scalar type AccountType extending enum<oidc,oauth,email>;
  type User {
    required email: str {
      constraint exclusive;
    }
    name: str;
    emailVerified: datetime {
      default := std::datetime_of_transaction();
    }
    image: str;
    multi sessions: Session {
      on target delete delete source;
    }
    multi accounts: Account {
      on target delete delete source;
    }
  }

  type Session {
    required sessionToken: str {
      constraint exclusive;
    }
    required expires: datetime {
      default := std::datetime_of_transaction();
    }
    required user: User
  }

  type Account {
    required user: User;
    required type: AccountType;
    required provider: str;
    required providerAccountId: str;
    refresh_token: str;
    access_token: str;
    expires_at: int32;
    token_type: str;
    scope: str;
    id_token: str;
    session_state: str;
    oauth_token_secret: str;
    oauth_token: str;

    constraint exclusive on ((.provider, .providerAccountId));
  }

  type VerificationToken {
    required token: str {
      constraint exclusive;
    }
    required identifier: str;
    required expires: datetime {
      default := std::datetime_of_transaction();
    }
  }
}
