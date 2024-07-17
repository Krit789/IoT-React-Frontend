import { ChangeEvent, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster, toast } from "react-hot-toast";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

interface IUser {
  sid: number;
  first_name: string;
  last_name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string;
  bio: string | null;
}

function App() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [createDialogState, setCreateDialogState] = useState<boolean>(false);
  const [tableCaption, setTableCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState<number>(1);
  const [currentUserInfo, setCurrentUserInfo] = useState<IUser | {}>({});
  const tableHead = [
    {
      title: "Student ID",
      class: "w-[100px]",
    },
    {
      title: "First Name",
      class: "",
    },
    {
      title: "Last Name",
      class: "",
    },
    {
      title: "Gender",
      class: "",
    },
    {
      title: "DOB",
      class: "",
    },
    {
      title: "Action",
      class: "text-right w-20",
    },
  ];

  const fetchUser = () => {
    setIsLoading(1);
    setTableCaption("Fetching Please Wait...");
    fetch("http://localhost:8000/api/v1/users")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        } else {
          return res.json();
        }
      })
      .then((data: IUser[]) => {
        setUsers(data);
        setIsLoading(0);
      })
      .catch((err) => {
        setUsers([]);
        setIsLoading(2);
        setTableCaption(err.toString());
      });
  };

  const updateUser = (payload: IUser) => {
    const saveToast = toast.loading("Saving User");

    setIsLoading(1);
    if ("sid" in currentUserInfo)
      fetch(`http://localhost:8000/api/v1/users/${payload.sid}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
          } else {
            return res.json();
          }
        })
        .then(() => {
          toast.success("Saving Successful", {
            id: saveToast,
          });
          fetchUser();
        })
        .catch((err) => {
          toast.error("Saving Failure", {
            id: saveToast,
          });
          setIsLoading(2);
          setTableCaption(err.toString());
        });
  };

  const deleteUser = (sid: number) => {
    const delToast = toast.loading("Deleting User");
    setIsLoading(1);

    if ("sid" in currentUserInfo)
      fetch(`http://localhost:8000/api/v1/users/${sid}`, {
        method: "DELETE",
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
          } else {
            return res.json();
          }
        })
        .then(() => {
          toast.success("Deletion Successful", {
            id: delToast,
          });
          fetchUser();
        })
        .catch((err) => {
          toast.error("Deletion Failure", {
            id: delToast,
          });
          setIsLoading(2);
          setTableCaption(err.toString());
        });
  };

  const createUser = (payload: IUser) => {
    const createUserToast = toast.loading("Creating User");
    setIsLoading(1);
      fetch(`http://localhost:8000/api/v1/users`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
          } else {
            return res.json();
          }
        })
        .then(() => {
          toast.success("User Creation Successful", {
            id: createUserToast,
          });
          fetchUser();
        })
        .catch((err) => {
          toast.error("User Creation Failure", {
            id: createUserToast,
          });
          setIsLoading(2);
          setTableCaption(err.toString());
        });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />
      <CreateUserDialog
        createUser={createUser}
        dialogState={createDialogState}
        setCreateDialogState={setCreateDialogState}
      />
      <main className="py-6 px-4 max-w-screen-xl mx-auto flex flex-col gap-y-4">
        <div className="flex justify-between md:items-center items-start md:flex-row flex-col gap-y-2">
          <h1 className="text-3xl font-bold">Vite + FastAPI IoT Demo</h1>
          <ButtonStatusDiv
            isLoading={isLoading}
            fetchUser={fetchUser}
            setCreateDialogState={setCreateDialogState}
          />
        </div>
        <div className="md:h-[55vh] h-[38vh] overflow-auto rounded-md border border-1 shadow-md">
          <Table className="relative">
            {isLoading === 1 && <TableCaption>{tableCaption}</TableCaption>}
            <TableHeader className="sticky top-0 bg-white shadow-sm dark:bg-zinc-900/80 backdrop-blur-sm">
              <TableRow>
                {tableHead.map((item) => (
                  <TableHead
                    key={`tbl_head_${item.title}`}
                    className={item.class}
                  >
                    {item.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {users &&
                users.map &&
                users.map((user) => (
                  <UserTableRow
                    key={`tbl_cell_${user.sid}`}
                    user={user}
                    setCurrentUserInfo={setCurrentUserInfo}
                  />
                ))}
            </TableBody>
          </Table>
        </div>
        {"first_name" in currentUserInfo && (
          <UserInfoEditorBox
            user={currentUserInfo}
            setCurrentUserInfo={setCurrentUserInfo}
            isLoading={isLoading}
            updateUser={updateUser}
            deleteUser={deleteUser}
          />
        )}
      </main>
    </ThemeProvider>
  );
}

function CreateUserDialog({
  createUser,
  dialogState,
  setCreateDialogState,
}: {
  createUser: Function;
  dialogState: boolean;
  setCreateDialogState: Function;
}) {
  const [childState, setChildState] = useState<IUser>({
    sid: 0,
    first_name: "",
    last_name: "",
    gender: "MALE",
    dob: "2024-02-10",
    bio: null,
  });
  const resetChildState = () => {
    setChildState({
      sid: 0,
      first_name: "",
      last_name: "",
      gender: "MALE",
      dob: "2024-02-10",
      bio: null,
    })
  }
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof IUser
  ) => {
    setChildState((prevState) => ({
      ...prevState,
      [key]: e.target.value,
    }));
  };
  return (
    <Dialog open={dialogState}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <div
            role="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => {setCreateDialogState(false); resetChildState()}}
          >
            <span className="material-icons mr-2">close</span>
          </div>
          <DialogDescription>Enter the following details.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-row flex-wrap gap-x-6 gap-y-4 text-left">
          <div className="grid items-center gap-1.5 w-full">
            <Label htmlFor="SID" className="font-bold">
              Student ID
            </Label>
            <Input
              type="number"
              id="SID"
              className="w-full"
              required
              value={childState.sid}
              onChange={(e) => {
                handleChange(e, "sid");
              }}
            />
          </div>
          <div className="grid items-center gap-1.5 w-full">
            <Label htmlFor="FirstName" className="font-bold">
              First Name
            </Label>
            <Input
              type="text"
              id="FirstName"
              className="w-full"
              required
              value={childState.first_name}
              onChange={(e) => {
                handleChange(e, "first_name");
              }}
            />
          </div>
          <div className="grid items-center gap-1.5 w-full">
            <Label htmlFor="LastName" className="font-bold">
              Last Name
            </Label>
            <Input
              type="text"
              id="LastName"
              className="w-full"
              required
              value={childState.last_name}
              onChange={(e) => {
                handleChange(e, "last_name");
              }}
            />
          </div>
          <div className="grid items-center gap-1.5 w-full">
            <Label htmlFor="LastName" className="font-bold">
              Gender
            </Label>
            <Select
              value={childState.gender}
              onValueChange={(e: "MALE" | "FEMALE" | "OTHER") => {
                setChildState((prevState) => ({
                  ...prevState,
                  gender: e,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid items-center gap-1.5 w-full">
            <Label htmlFor="DoB" className="font-bold">
              Date of Birth
            </Label>
            <Input
              type="datetime-local"
              id="DoB"
              className="w-full"
              defaultValue={childState.dob.substring(0,19)}
              onChange={(e) => {
                handleChange(e, "dob");
              }}
            />
          </div>
          <div className="grid items-center gap-1.5 w-full">
          <Label htmlFor="Bio" className="font-bold">
              Biography
            </Label>
            <Textarea
              rows={1}
              id="Bio"
              className="w-full"
              value={childState.bio || ""}
              onChange={(e) => {
                handleChange(e, "bio");
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => {setCreateDialogState(false); resetChildState()}}>Cancel</Button>
          <Button onClick={() => {createUser(childState); setCreateDialogState(false); resetChildState()}}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserTableRow({
  user,
  setCurrentUserInfo,
}: {
  user: IUser;
  setCurrentUserInfo: React.Dispatch<React.SetStateAction<{} | IUser>>;
}) {
  return (
    <TableRow key={`table_${user.sid}`}>
      <TableCell className="font-medium">{user.sid}</TableCell>
      <TableCell>{user.first_name}</TableCell>
      <TableCell>{user.last_name}</TableCell>
      <TableCell>{user.gender}</TableCell>
      <TableCell>{new Date(user.dob).toLocaleDateString()}</TableCell>
      <TableCell>
        <div
          className="flex flex-row w-24 flex-nowrap items-center justify-center hover:bg-slate-200 cursor-pointer bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 py-1 rounded-md gap-1 transition-colors duration-150 select-none"
          role="button"
          onClick={() => setCurrentUserInfo(user)}
        >
          <span
            className="material-icons overflow-hidden"
            style={{ fontSize: "14px" }}
          >
            arrow_downward
          </span>
          <p className="text-xs whitespace-nowrap">Show Below</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

function UserInfoEditorBox({
  user,
  setCurrentUserInfo,
  isLoading,
  updateUser,
  deleteUser,
}: {
  user: IUser;
  setCurrentUserInfo: React.Dispatch<React.SetStateAction<{} | IUser>>;
  isLoading: number;
  updateUser: Function;
  deleteUser: Function;
}) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteConfirmDiag, setDeleteConfirmDiag] = useState<boolean>(false);
  const [childState, setChildState] = useState<IUser>({
    sid: 0,
    first_name: "",
    last_name: "",
    gender: "MALE",
    dob: "",
    bio: null,
  });

  useEffect(() => {
    setChildState(() => ({ ...user }));
    setEditMode(false);
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof IUser
  ) => {
    setChildState((prevState) => ({
      ...prevState,
      [key]: e.target.value,
    }));
  };

  return (
    <>
      <AlertDialog open={deleteConfirmDiag}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmDiag(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteConfirmDiag(false);
                deleteUser(childState.sid);
                setTimeout(() => setCurrentUserInfo({}), 150);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border border-1 shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Info</h1>
          <div
            className="flex flex-nowrap items-center cursor-pointer select-none"
            onClick={() => setCurrentUserInfo({})}
          >
            <span className="material-icons mr-2">close</span>
          </div>
        </div>
        <hr className="mb-4 mt-2"></hr>
        <div className="flex flex-row flex-wrap gap-x-6 gap-y-4">
          <div className="grid items-center gap-1.5 sm:w-auto w-full">
            <Label htmlFor="SID" className="font-bold">
              Student ID
            </Label>
            {!editMode ? (
              <p className="p-2 w-36">
                {"sid" in childState ? childState.sid : ""}
              </p>
            ) : (
              <Input
                type="number"
                id="SID"
                className="sm:w-36 w-full"
                disabled={!editMode}
                value={childState.sid}
                onChange={(e) => {
                  handleChange(e, "sid");
                }}
              />
            )}
          </div>
          <div className="grid items-center gap-1.5 sm:w-auto w-full">
            <Label htmlFor="FirstName" className="font-bold">
              First Name
            </Label>
            {!editMode ? (
              <p className="p-2 sm:w-40 w-full">
                {"first_name" in childState ? childState.first_name : ""}
              </p>
            ) : (
              <Input
                type="text"
                id="FirstName"
                className="sm:w-40 w-full"
                disabled={!editMode}
                value={childState.first_name}
                onChange={(e) => {
                  handleChange(e, "first_name");
                }}
              />
            )}
          </div>
          <div className="grid items-center gap-1.5 sm:w-auto w-full">
            <Label htmlFor="LastName" className="font-bold">
              Last Name
            </Label>
            {!editMode ? (
              <p className="p-2 w-40">
                {"last_name" in childState ? childState.last_name : ""}
              </p>
            ) : (
              <Input
                type="text"
                id="LastName"
                className="sm:w-40 w-full"
                disabled={!editMode}
                value={childState.last_name}
                onChange={(e) => {
                  handleChange(e, "last_name");
                }}
              />
            )}
          </div>
          <div className="grid items-center gap-1.5 sm:w-auto w-full">
            <Label htmlFor="LastName" className="font-bold">
              Gender
            </Label>
            {!editMode ? (
              <p className="p-2 w-36">
                {"gender" in childState ? childState.gender : ""}
              </p>
            ) : (
              <Select
                value={childState.gender}
                onValueChange={(e: "MALE" | "FEMALE" | "OTHER") => {
                  setChildState((prevState) => ({
                    ...prevState,
                    gender: e,
                  }));
                }}
              >
                <SelectTrigger className="sm:w-36 w-full">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid items-center gap-1.5 sm:w-fit w-full">
            <Label htmlFor="DoB" className="font-bold">
              Date of Birth
            </Label>
            {!editMode ? (
              <p className="p-2 w-50">
                {"dob" in childState
                  ? new Date(childState.dob).toLocaleString()
                  : ""}
              </p>
            ) : (
              <Input
                type="datetime-local"
                id="DoB"
                className="sm:w-50 w-full"
                disabled={!editMode}
                defaultValue={childState.dob.substring(0,19)}
                onChange={(e) => {
                  handleChange(e, "dob");
                }}
              />
            )}
          </div>
          <div className="w-full"></div>
          {(childState.bio || editMode) && (
            <div className="grid items-center gap-1.5 w-full">
              <Label htmlFor="Bio" className="font-bold">
                Biography
              </Label>
              {!editMode ? (
                <p className="p-2 sm:w-96 w-full min-h-[80px]">
                  {"bio" in childState ? childState.bio : ""}
                </p>
              ) : (
                <Textarea
                  rows={1}
                  id="Bio"
                  className="sm:w-96 w-full"
                  value={childState.bio || ""}
                  onChange={(e) => {
                    handleChange(e, "bio");
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex flex-row gap-4 mt-4 justify-end">
          <Button
            variant="secondary"
            color="lightblue"
            disabled={isLoading === 1}
            onClick={() => {
              if (editMode) setChildState(() => ({ ...user }));
              setEditMode(!editMode);
            }}
          >
            <span className="material-icons mr-2">
              {editMode ? "undo" : "edit"}
            </span>
            {editMode ? "Revert" : "Edit"}
          </Button>
          {!editMode && (
            <Button
              disabled={isLoading === 1}
              variant="destructive"
              onClick={() => {
                setDeleteConfirmDiag(true);
              }}
            >
              <span className="material-icons mr-2">delete</span>Delete
            </Button>
          )}
          {editMode && (
            <Button
              disabled={isLoading === 1}
              variant="default"
              onClick={() => {
                setCurrentUserInfo(() => ({ ...childState }));
                updateUser({ ...childState });
              }}
            >
              <span className="material-icons mr-2">save</span>Save
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function ButtonStatusDiv({
  isLoading,
  fetchUser,
  setCreateDialogState,
}: {
  isLoading: number;
  fetchUser: Function;
  setCreateDialogState: Function;
}) {
  const themePref  = () => {
    const localThemeSettings = localStorage.getItem('vite-ui-theme')
    if (localThemeSettings && ['system', 'light', 'dark'].includes(localThemeSettings))
      return localThemeSettings
    return 'system'
  };
  const [appTheme, setAppTheme] = useState<string>(themePref())
  const { setTheme } = useTheme()
  useEffect(() => {
    setTheme(appTheme as "light" | "dark" | "system")
  }, [appTheme])
  const toggleTheme = () => {
    switch (appTheme){
      case "light":
        setAppTheme('dark')
        break;
      case "dark":
        setAppTheme('system')
        break;
      case "system":
        setAppTheme('light')
        break;
    }
  }
  return (
    <div className="flex flex-row gap-x-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => toggleTheme()}
      >
        <span className="material-icons mr-2" style={{ fontSize: "18px" }}>
          {appTheme === 'light' ? "light_mode" : appTheme === 'dark' ? "dark_mode" : appTheme === 'system' ? "auto_awesome" : "auto_awesome"}
        </span>
        Toggle theme
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isLoading === 1}
        onClick={() => setCreateDialogState(true)}
      >
        <span className="material-icons mr-2" style={{ fontSize: "18px" }}>
          add
        </span>
        Create
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isLoading === 1 || isLoading === 2}
        onClick={() => fetchUser()}
      >
        <span
          className={`material-icons mr-2 ${
            isLoading === 1 ? "animate-spin" : ""
          }`}
          style={{ fontSize: "18px" }}
        >
          refresh
        </span>
        Refresh
      </Button>
      <div className="flex size-9 flex-row gap-x-2 border bottom-1 justify-center items-center px-2 rounded-md shadow-sm  select-none pointer-events-none text-center">
        {isLoading === 0 && (
          <span className="material-icons">download_done</span>
        )}
        {isLoading === 1 && <span className="material-icons">downloading</span>}
        {isLoading === 2 && <span className="material-icons">error</span>}
      </div>
    </div>
  );
}

export default App;
