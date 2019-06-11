import { AuthChecker    } from "type-graphql";
import { ResolveContext } from "graphql/resolve-context";
import { UserRole       } from "domains/users/model";

export const authChecker: AuthChecker<ResolveContext, UserRole> = ({context: {user}}, roles) => (
    user != null && roles.includes(user.role)
);
