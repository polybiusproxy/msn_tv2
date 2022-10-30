
var	UPDATE_TASK_CALLER_NAME		= "NightlyUpdate";
var	EMAILCHECK_TASK_CALLER_NAME		= "NightlyEmailCheck";

function GetTask(TaskScheduler,taskCallerName)
{
	var count=TaskScheduler.Count;
    var task=null;
	for(i=0;i<count;i++)
	{ 
	  task=TaskScheduler.Item(i)
	  if(task.Caller==taskCallerName && task.Once==0)
            return task;
	}
	return null;
}

function RemoveAllOccurrence(caller,TaskScheduler,removeFirst)
{
	var task
	var ItemRemoved=true;
	while(TaskScheduler.Count!=0 && ItemRemoved)
	{
		for (var i = 0; i < TaskScheduler.Count; i++)
		{   
			task=TaskScheduler.Item(i);
			if (task.Caller == caller)
			{ 
			  if(removeFirst)
			  {
				TaskScheduler.Remove(task.ID);
				ItemRemoved = true;
				break;
			  }
			  else if(task.Once!=0)
			  {
				TaskScheduler.Remove(task.ID);
				ItemRemoved = true;
				break;
			  }
			}

			ItemRemoved=false;
		}
	 }
}

function ScheduleAllOccurrence(firstTask,TaskScheduler)
{
    var task
    var previous=firstTask;
	var firstTaskInMinutes=firstTask.Hour*60+firstTask.Minute;
	var taskInMinutes=firstTaskInMinutes;
	var hour;
	var more=false;
		
    
	if(24*60<firstTask.Next+60) // do not schule another one since this is only once a day task
	    return;
    
    do
	{
		task=TaskScheduler.Add();
		task.Caller=previous.Caller;
		task.Once=1;
		task.Next=previous.Next;
		task.Active=true;
		task.AsLateAs=previous.AsLateAs; 
		taskInMinutes+=previous.Next;


		hour=Math.floor(taskInMinutes/60)
		if(hour<24)
		  task.Hour=hour;
		else
		  task.Hour=hour-24;
		
		task.Minute=taskInMinutes-hour*60;

		if((taskInMinutes-firstTaskInMinutes)<(24*60-firstTask.Next))
		{
		   previous=task;
		   more=true;
		}
		else
		   more=false;
		  
     }while(more);

	 DumpTask(firstTask.caller,TaskScheduler)
}

// this function is for debug purpose
function DumpTask(caller,TaskScheduler)
{
   var task;
   var info;
   for(i=0;i<TaskScheduler.Count;i++)
   {
     task=TaskScheduler.Item(i);
	 if(task.Caller==caller)
	 {
		info="Task "+caller +" scheduled at "+task.Hour + " : " + task.Minute + " ("+task.Once+")\n";
        info +="last HI = "+ task.LastHI + "last LO = "+ task.LastLO +"\n";
	    TVShell.Message(info);
	 } 
   }

}
